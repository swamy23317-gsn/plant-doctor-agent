import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { caseIntakeSchema, diagnosisSchema, verificationSchema, type CaseIntake, type Diagnosis, type Verification } from '../lib/schemas.ts'
import { plantProblems } from '../lib/knowledge-base.ts'
import { writeAuditEntry } from '../lib/audit.ts'

const validKbIds = plantProblems.map(p => p.id)

const caseInputSchema = z.object({
  sessionId: z.string().describe('Stable session identifier for the audit trail.'),
  userId: z.string().optional().describe('End user identifier if available.'),
  channel: z.enum(['chat', 'whatsapp', 'web', 'api', 'field-app']).default('api'),
  message: z.string().describe('The raw problem description from the farmer or gardener.'),
})

const kbEntryBrief = (id: string) => {
  const entry = plantProblems.find(p => p.id === id)
  if (!entry) return null
  return {
    id: entry.id,
    title: entry.title,
    symptoms: entry.symptoms,
    likelyCauses: entry.likelyCauses,
    treatment: entry.treatment,
    prevention: entry.prevention,
    severity: entry.severity,
  }
}

function parseKbSources(text: string): string[] {
  const match = text.match(/KB_SOURCES:\s*(.+)$/im)
  if (!match) return []
  return match[1]
    .split(/[,\s]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => validKbIds.includes(s))
}

const extractCaseStep = createStep({
  id: 'extract-case',
  description: 'Turn the raw user message into a structured case intake.',
  inputSchema: caseInputSchema,
  outputSchema: caseIntakeSchema.extend({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('Input data missing')
    const extractor = mastra.getAgentById('case-extractor')

    const prompt = `Extract a structured plant-health case from the message below.

MESSAGE:
"""
${inputData.message}
"""

Rules:
- Use "unknown" for plantType when not stated.
- Keep observedSymptoms verbatim to what the user described.
- missingCriticalInfo must list only facts that would change the diagnosis if known.
- Do not diagnose. Do not infer causes.`
    const response = await extractor.generate(prompt, { structuredOutput: { schema: caseIntakeSchema } })

    const intake = { ...response.object, sessionId: inputData.sessionId, userId: inputData.userId, channel: inputData.channel }

    await writeAuditEntry({
      sessionId: inputData.sessionId,
      caseId: inputData.sessionId,
      stage: 'intake',
      status: intake.missingCriticalInfo.length > 0 ? 'flagged' : 'pass',
      input: inputData.message,
      output: intake,
    })

    return intake
  },
})

const diagnoseStep = createStep({
  id: 'diagnose',
  description: 'Run the Plant Doctor protocol with knowledge-base tools to produce a grounded diagnostic report.',
  inputSchema: caseIntakeSchema.extend({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
    intake: caseIntakeSchema,
    diagnosisText: z.string(),
    kbSourceIds: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('Input data missing')
    const doctor = mastra.getAgentById('plant-doctor')
    const { sessionId, userId, channel, ...intake } = inputData

    const prompt = `New diagnostic case.

CASE INTAKE:
${JSON.stringify(intake, null, 2)}

Original user message:
"""
${intake.problemSummary}
"""

Produce your full diagnostic report following your protocol (search the knowledge base first).
End your report with exactly one final line in this format:
KB_SOURCES: <kb-entry-id>, <kb-entry-id>
or "KB_SOURCES: none" if nothing in the knowledge base matched.`
    const response = await doctor.generate(prompt)
    const diagnosisText = response.text
    const kbSourceIds = parseKbSources(diagnosisText)

    await writeAuditEntry({
      sessionId,
      caseId: sessionId,
      stage: 'diagnosis',
      status: kbSourceIds.length > 0 ? 'pass' : 'flagged',
      output: { diagnosisText, kbSourceIds, toolCalls: response.toolCalls?.length ?? 0 },
      model: process.env.MASTRA_MODEL ?? 'openai/gpt-5.6-sol',
    })

    return { sessionId, userId, channel, intake, diagnosisText, kbSourceIds }
  },
})

const verifyStep = createStep({
  id: 'verify-answer',
  description: 'Verify the diagnosis against the knowledge base, remediate once on failure, and re-verify.',
  inputSchema: z.object({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
    intake: caseIntakeSchema,
    diagnosisText: z.string(),
    kbSourceIds: z.array(z.string()),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
    intake: caseIntakeSchema,
    diagnosisText: z.string(),
    kbSourceIds: z.array(z.string()),
    verification: verificationSchema,
    attempts: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('Input data missing')
    const { sessionId, intake, ...rest } = inputData
    const extractor = mastra.getAgentById('case-extractor')
    const doctor = mastra.getAgentById('plant-doctor')

    const citedEntries = rest.kbSourceIds.map(kbEntryBrief).filter(Boolean)

    const runVerification = async (text: string): Promise<Verification> => {
      const prompt = `You are verifying a plant diagnosis report against a knowledge base.

CASE INTAKE:
${JSON.stringify(intake, null, 2)}

REPORT UNDER REVIEW:
"""
${text}
"""

CITED KNOWLEDGE BASE ENTRIES (actual content):
${JSON.stringify(citedEntries, null, 2)}

ALL VALID KNOWLEDGE BASE IDs: ${validKbIds.join(', ')}

Check strictly:
1. grounded — every recommendation and claim in the report is supported by the cited KB entry content above (or is clearly marked external agronomic reasoning).
2. internallyConsistent — the selected diagnosis explains the major symptoms in the intake; no contradictions.
3. actionable — each immediate action is specific enough for a novice to perform safely.
4. noHallucinatedSources — every KB id cited in the report exists in the ALL VALID IDs list, and the report does not attribute claims to entries that do not contain them.

Report every issue found. verdict is "fail" if any of the four checks is false.`
      const res = await extractor.generate(prompt, { structuredOutput: { schema: verificationSchema } })
      return res.object
    }

    let verification = await runVerification(rest.diagnosisText)
    let diagnosisText = rest.diagnosisText
    let kbSourceIds = rest.kbSourceIds
    let attempts = 1

    if (verification.verdict === 'fail') {
      const retryPrompt = `Your previous diagnostic report failed verification.

FAILED CHECKS / ISSUES:
${verification.issues.map((i, n) => `${n + 1}. ${i}`).join('\n')}

CASE INTAKE:
${JSON.stringify(intake, null, 2)}

PREVIOUS REPORT:
"""
${diagnosisText}
"""

Produce a corrected full diagnostic report. If the knowledge base does not support a claim, remove it or clearly label it as general agronomic reasoning. Keep the same output format and end with the KB_SOURCES: line.`
      const retry = await doctor.generate(retryPrompt)
      diagnosisText = retry.text
      kbSourceIds = parseKbSources(diagnosisText)
      citedEntries.length = 0
      citedEntries.push(...kbSourceIds.map(kbEntryBrief).filter(Boolean))
      verification = await runVerification(diagnosisText)
      attempts = 2
    }

    await writeAuditEntry({
      sessionId,
      caseId: sessionId,
      stage: 'verification',
      status: verification.verdict === 'pass' ? 'pass' : 'fail',
      checks: [
        { name: 'grounded', passed: verification.grounded, detail: verification.issues.join('; ') },
        { name: 'internallyConsistent', passed: verification.internallyConsistent, detail: '' },
        { name: 'actionable', passed: verification.actionable, detail: '' },
        { name: 'noHallucinatedSources', passed: verification.noHallucinatedSources, detail: '' },
      ],
      output: verification,
      attempts,
    })

    return { sessionId, userId: rest.userId, channel: rest.channel, intake, diagnosisText, kbSourceIds, verification, attempts }
  },
})

const finalReportSchema = z.object({
  caseId: z.string(),
  status: z.enum(['verified', 'needs-expert']),
  finalAnswer: z.string(),
  diagnosis: diagnosisSchema,
  intake: caseIntakeSchema,
  verification: verificationSchema,
  attempts: z.number(),
})

const finalizeStep = createStep({
  id: 'finalize',
  description: 'Structure the verified answer into a typed report and close the audit trail.',
  inputSchema: z.object({
    sessionId: z.string(),
    userId: z.string().optional(),
    channel: z.string(),
    intake: caseIntakeSchema,
    diagnosisText: z.string(),
    kbSourceIds: z.array(z.string()),
    verification: verificationSchema,
    attempts: z.number(),
  }),
  outputSchema: finalReportSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) throw new Error('Input data missing')
    const { sessionId, channel, ...rest } = inputData
    const extractor = mastra.getAgentById('case-extractor')

    const prompt = `Convert this verified diagnostic report into structured JSON.

CASE INTAKE:
${JSON.stringify(rest.intake, null, 2)}

VERIFIED REPORT:
"""
${rest.diagnosisText}
"""

VALID KB IDs: ${validKbIds.join(', ')}
KB IDs actually cited by the report: ${rest.kbSourceIds.join(', ') || 'none'}

Rules:
- confidence values must reflect the evidence in the report, not optimism.
- knowledgeBaseUsed is true only if KB IDs were cited.
- sources must contain only real KB IDs from the cited list (or "external" markers from the report).
- If the report requires expert escalation, set requiresHumanEscalation accordingly.`
    const res = await extractor.generate(prompt, { structuredOutput: { schema: diagnosisSchema } })
    const diagnosis: Diagnosis = res.object

    const needsExpert = diagnosis.requiresHumanEscalation || rest.verification.verdict === 'fail'
    const caseId = `case-${sessionId}-${Date.now().toString(36)}`

    await writeAuditEntry({
      sessionId,
      caseId,
      stage: 'final',
      status: needsExpert ? 'flagged' : 'pass',
      output: { caseId, verdict: rest.verification.verdict, selectedDiagnosis: diagnosis.selectedDiagnosis, channel },
    })

    return {
      caseId,
      status: needsExpert ? ('needs-expert' as const) : ('verified' as const),
      finalAnswer: rest.diagnosisText,
      diagnosis,
      intake: rest.intake,
      verification: rest.verification,
      attempts: rest.attempts,
    }
  },
})

export const diagnosisWorkflow = createWorkflow({
  id: 'diagnosis-workflow',
  description: 'Structured pipeline: extract case → diagnose with tools → verify and remediate → audit and report.',
  inputSchema: caseInputSchema,
  outputSchema: finalReportSchema,
})
  .then(extractCaseStep)
  .then(diagnoseStep)
  .then(verifyStep)
  .then(finalizeStep)
  .commit()
