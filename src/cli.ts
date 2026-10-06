import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import './load-env.ts'
import { mastra } from './mastra/index.ts'

const threadId = process.env.CHAT_THREAD_ID ?? `cli-${Date.now()}`
const resourceId = process.env.CHAT_USER_ID ?? 'local-user'

const rl = readline.createInterface({ input, output })

console.log('Plant Doctor — agricultural diagnostic assistant')
console.log('Describe a plant problem, or type "exit" to quit.\n')

const agent = mastra.getAgentById('plant-doctor')

while (true) {
  const message = (await rl.question('\nyou > ')).trim()
  if (!message) continue
  if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') break

  const response = await agent.generate(message, { memory: { thread: threadId, resource: resourceId } })
  console.log(`\nplant doctor >\n${response.text}`)
}

rl.close()
