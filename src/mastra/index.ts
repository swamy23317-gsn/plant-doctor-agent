import '../load-env.ts'
import { Mastra } from '@mastra/core'
import { LibSQLStore } from '@mastra/libsql'
import { dbUrl } from './lib/db.ts'
import { plantAgent } from './agents/plant-agent.ts'
import { extractorAgent } from './agents/extractor-agent.ts'
import { diagnosisWorkflow } from './workflows/diagnosis-workflow.ts'

export const mastra = new Mastra({
  agents: { plantAgent, extractorAgent },
  workflows: { diagnosisWorkflow },
  storage: new LibSQLStore({ id: 'plantgenius', url: dbUrl }),
})
