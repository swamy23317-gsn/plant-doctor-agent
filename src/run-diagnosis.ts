import { mastra } from './mastra/index.ts'

const message =
  process.argv.slice(2).join(' ') ||
  'My tomato plant has white powdery spots on the lower leaves and they are curling. It is in a garden bed, watered every evening, and it started about four days ago.'

const sessionId = `run-${Date.now().toString(36)}`

console.log(`Case ${sessionId}`)
console.log(`Message: ${message}\n`)

const workflow = mastra.getWorkflowById('diagnosis-workflow')
const run = await workflow.createRun()
const outcome = await run.start({ inputData: { sessionId, message, channel: 'api' } })

if (outcome.status !== 'success') {
  console.error('Workflow did not succeed:', outcome)
  process.exit(1)
}

const result = outcome.result

console.log('STATUS:', result.status)
console.log('CASE:', result.caseId)
console.log('ATTEMPTS:', result.attempts)
console.log('VERDICT:', result.verification.verdict)
console.log('DIAGNOSIS:', result.diagnosis.selectedDiagnosis, `(${result.diagnosis.severity})`)
console.log('\n--- FINAL ANSWER ---\n')
console.log(result.finalAnswer)
