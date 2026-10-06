import './load-env.ts'
import { searchProblems, getCareGuide, getSeasonalTasks } from './mastra/lib/knowledge-base.ts'
import { writeAuditEntry } from './mastra/lib/audit.ts'

const cases: [string, string][] = [
  ['tomato white powdery spots on lower leaves, curling', 'powdery-mildew'],
  ['white powder dust on squash leaves', 'powdery-mildew'],
  ['cucumber leaves with fine webbing and yellow speckles', 'spider-mites'],
  ['tomato fruit has black leathery patch on the bottom', 'blossom-end-rot'],
  ['seedlings collapsed at soil line overnight', 'damping-off'],
  ['lettuce with irregular holes and slime trails', 'slugs'],
  ['yellow leaves with green veins on blueberry', 'chlorosis-iron'],
  ['houseplant wilting even though soil is wet', 'root-rot'],
]

let failed = 0
for (const [query, expected] of cases) {
  const top = searchProblems(query, 1)[0]
  const ok = top?.id === expected
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${query} -> ${top?.id ?? 'no match'} (expected ${expected})`)
}

const guide = getCareGuide('tomato')
console.log(`care guide for tomato: ${guide ? 'found' : 'MISSING'}`)
if (!guide) failed++

const seasonal = getSeasonalTasks('summer', 'temperate')
console.log(`summer temperate tasks: ${seasonal.length > 0 ? seasonal[0].tasks.length + ' tasks' : 'MISSING'}`)
if (seasonal.length === 0) failed++

await writeAuditEntry({ sessionId: 'smoke-test', caseId: 'smoke-1', stage: 'gateway', status: 'pass', output: { check: 'audit-write' } })
console.log('audit entry written to audit/diagnosis-log.jsonl')

console.log(failed === 0 ? '\nALL SMOKE TESTS PASSED' : `\n${failed} FAILURES`)
process.exit(failed === 0 ? 0 : 1)
