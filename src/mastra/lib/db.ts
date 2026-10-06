import { resolve } from 'node:path'

const dbPath = resolve(process.cwd(), process.env.MASTRA_DB_FILE ?? 'plantgenius.db').replace(/\\/g, '/')

export const dbUrl = `file:${dbPath}`
