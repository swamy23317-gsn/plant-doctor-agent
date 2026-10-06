import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const auditDir = join(here, '..', '..', '..', 'audit')
const auditFile = join(auditDir, 'diagnosis-log.jsonl')

export interface AuditEntry {
  timestamp: string
  sessionId: string
  caseId: string
  stage: 'intake' | 'diagnosis' | 'verification' | 'final' | 'gateway'
  status: 'pass' | 'fail' | 'flagged' | 'info'
  input?: unknown
  output?: unknown
  checks?: { name: string; passed: boolean; detail: string }[]
  model?: string
  attempts?: number
}

export async function writeAuditEntry(entry: Omit<AuditEntry, 'timestamp'>): Promise<AuditEntry> {
  const record: AuditEntry = { timestamp: new Date().toISOString(), ...entry }
  await mkdir(auditDir, { recursive: true })
  await appendFile(auditFile, JSON.stringify(record) + '\n', 'utf-8')
  return record
}
