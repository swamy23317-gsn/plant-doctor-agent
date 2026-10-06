import { z } from 'zod'

export const caseIntakeSchema = z.object({
  plantType: z
    .string()
    .describe('The specific plant or crop, e.g. "tomato", "basil", "lawn". "unknown" if not stated.'),
  userContext: z.enum(['farmer', 'home-gardener', 'unknown']).describe('Who is asking.'),
  problemSummary: z.string().describe('One-sentence summary of the reported problem.'),
  observedSymptoms: z
    .array(z.string())
    .describe('Symptom phrases exactly as the user described them.'),
  location: z.string().optional().describe('Growing location: field, garden, pot, greenhouse, indoors.'),
  climate: z.string().optional().describe('Region or climate if mentioned.'),
  timeline: z.string().optional().describe('When symptoms started or how fast they progressed.'),
  wateringFrequency: z.string().optional().describe('Watering schedule if mentioned.'),
  recentActions: z
    .array(z.string())
    .optional()
    .describe('Recent fertilizing, spraying, transplanting, pruning, etc.'),
  missingCriticalInfo: z
    .array(z.string())
    .describe('Critical facts still needed before a confident diagnosis, if any.'),
})

export const diagnosisSchema = z.object({
  problemSummary: z.string().describe('Restatement of the problem in one sentence.'),
  candidateProblems: z
    .array(
      z.object({
        problemId: z.string().describe('ID from the knowledge base, or "external" if not in KB.'),
        name: z.string(),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().describe('Why this fits the observed symptoms.'),
        distinguishingEvidence: z.array(z.string()).describe('Symptoms that point to this vs alternatives.'),
      }),
    )
    .describe('Ranked differential diagnosis, most likely first.'),
  selectedDiagnosis: z.string().describe('Name of the most likely problem.'),
  severity: z.enum(['low', 'medium', 'high']),
  recommendations: z
    .array(
      z.object({
        action: z.string(),
        priority: z.enum(['immediate', 'short-term', 'long-term']),
        rationale: z.string(),
      }),
    )
    .describe('Concrete, ordered actions the user should take.'),
  preventionPlan: z.array(z.string()),
  followUpQuestions: z.array(z.string()).describe('What to check next to confirm the diagnosis.'),
  requiresHumanEscalation: z
    .boolean()
    .describe('True when the case exceeds safe self-service (crop-wide threat, unknown toxin, legal restrictions).'),
  escalationReason: z.string().optional(),
  knowledgeBaseUsed: z.boolean().describe('Whether findings were grounded in knowledge-base tool results.'),
  sources: z.array(z.string()).describe('KB entry IDs or tool names relied upon.'),
})

export const verificationSchema = z.object({
  grounded: z.boolean().describe('Are recommendations supported by cited sources / KB entries?'),
  internallyConsistent: z.boolean().describe('Does the diagnosis match the reported symptoms without contradictions?'),
  actionable: z.boolean().describe('Are recommendations specific and safe to perform?'),
  noHallucinatedSources: z.boolean().describe('Are all cited sources real tool results or KB entry IDs?'),
  issues: z.array(z.string()).describe('Specific problems found. Empty if all checks pass.'),
  verdict: z.enum(['pass', 'fail']),
  revisedRecommendations: z
    .array(z.string())
    .optional()
    .describe('Corrected action list if any issue was fixable.'),
})

export type CaseIntake = z.infer<typeof caseIntakeSchema>
export type Diagnosis = z.infer<typeof diagnosisSchema>
export type Verification = z.infer<typeof verificationSchema>
