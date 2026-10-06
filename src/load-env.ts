import { existsSync } from 'node:fs'

try {
  if (existsSync('.env')) process.loadEnvFile('.env')
} catch {
  // environment stays as-is if .env cannot be parsed
}
