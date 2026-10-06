import '../load-env.ts'
import { appendFileSync } from 'node:fs'
import qrcode from 'qrcode-terminal'
import { writeQrSvg, openInViewer } from './qr-svg.ts'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
} from '@whiskeysockets/baileys'
import type { BaileysEventMap, WAMessage } from '@whiskeysockets/baileys'
import { mastra } from '../mastra/index.ts'
import { writeAuditEntry } from '../mastra/lib/audit.ts'

const SESSION_DIR = process.env.WA_SESSION_DIR ?? '.wa-session'
const ALLOW_GROUPS = process.env.WA_ALLOW_GROUPS === 'true'
const MODEL = process.env.MASTRA_MODEL ?? 'openai/gpt-5.6-sol'
const MAX_REPLY_CHUNK = 4000

const agent = mastra.getAgentById('plant-doctor')

const queues = new Map<string, Promise<void>>()
const seenMessageIds = new Set<string>()
const sentByUs = new Set<string>()
const ownJids = new Set<string>()
const threads = new Map<string, string>()
let reconnectAttempts = 0
let qrOpened = false
let activeSocket: ReturnType<typeof makeWASocket> | undefined

function glog(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}`
  console.log(line)
  try {
    appendFileSync('gateway.log', line + '\n')
  } catch {
    // file logging is best-effort
  }
}

function normalizeJid(jid: string): string {
  const [local, server] = jid.split('@')
  if (!server) return jid
  return `${local.split(':')[0]}@${server}`
}

function collectOwnJids(sock: ReturnType<typeof makeWASocket>): void {
  const u = sock.user as unknown as { id?: string; lid?: string } | undefined
  if (u?.id) ownJids.add(normalizeJid(u.id))
  if (u?.lid) ownJids.add(normalizeJid(u.lid))
}

function enqueue(jid: string, job: () => Promise<void>): void {
  const previous = queues.get(jid) ?? Promise.resolve()
  const next = previous.then(job).catch(err => console.error(`[gateway] job failed for ${jid}:`, err))
  queues.set(jid, next)
  void next.then(() => {
    if (queues.get(jid) === next) queues.delete(jid)
  })
}

function extractText(msg: WAMessage): string {
  const m = msg.message
  if (!m) return ''
  return (
    m.conversation ??
    m.extendedTextMessage?.text ??
    m.imageMessage?.caption ??
    m.videoMessage?.caption ??
    m.buttonsResponseMessage?.selectedDisplayText ??
    m.listResponseMessage?.title ??
    m.templateButtonReplyMessage?.selectedDisplayText ??
    ''
  ).trim()
}

function hasMedia(msg: WAMessage): boolean {
  const m = msg.message
  return Boolean(m?.imageMessage || m?.videoMessage || m?.audioMessage || m?.documentMessage)
}

function chunkReply(text: string): string[] {
  if (text.length <= MAX_REPLY_CHUNK) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > MAX_REPLY_CHUNK) {
    const window = remaining.slice(0, MAX_REPLY_CHUNK)
    const breakAt = window.lastIndexOf('\n\n') > 400 ? window.lastIndexOf('\n\n') : window.lastIndexOf('\n')
    const cut = breakAt > 400 ? breakAt : MAX_REPLY_CHUNK
    chunks.push(remaining.slice(0, cut).trimEnd())
    remaining = remaining.slice(cut).trimStart()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}

async function generateReply(jid: string, text: string): Promise<string> {
  if (!agent) throw new Error('plant-doctor agent not registered')
  const thread = threads.get(jid) ?? jid
  const response = await agent.generate(text, {
    memory: { thread, resource: 'whatsapp' },
  })
  return response.text
}

async function handleMessage(sock: ReturnType<typeof makeWASocket>, msg: WAMessage): Promise<void> {
  const jid = msg.key.remoteJid
  if (!jid) return
  if (jid === 'status@broadcast') return

  const isSelfChat = ownJids.has(normalizeJid(jid))
  // fromMe messages are ignored unless they are in the account's own
  // self-chat ("message yourself") — that is the single-phone test path.
  if (msg.key.fromMe && !isSelfChat) return
  if (jid.endsWith('@g.us') && !ALLOW_GROUPS) return
  if (!jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@lid') && !isSelfChat) return

  glog(
    `msg received: jid=${jid} fromMe=${Boolean(msg.key.fromMe)} selfChat=${isSelfChat} id=${msg.key.id ?? '?'}`,
  )

  const messageId = msg.key.id
  if (messageId) {
    if (sentByUs.has(messageId)) return
    if (seenMessageIds.has(messageId)) return
    seenMessageIds.add(messageId)
    if (seenMessageIds.size > 2000) {
      const first = seenMessageIds.values().next().value
      if (first) seenMessageIds.delete(first)
    }
  }

  const text = extractText(msg)
  if (!text && !hasMedia(msg)) return

  enqueue(jid, async () => {
    try {
      await sock.readMessages([msg.key])
    } catch {
      // read receipts are best-effort
    }

    const input = text || '[media message without caption]'

    if (/^\/?reset$/i.test(input)) {
      const newThread = `${jid}:${Date.now()}`
      threads.set(jid, newThread)
      await sock.sendMessage(jid, { text: 'Conversation reset. Ask me anything about your plants — this is a fresh session.' })
      await writeAuditEntry({ sessionId: newThread, caseId: newThread, stage: 'gateway', status: 'info', input: '/reset', output: 'session reset' })
      return
    }

    await sock.sendPresenceUpdate('composing', jid).catch(() => {})

    let reply: string
    try {
      if (!text && hasMedia(msg)) {
        reply =
          'I received a photo/video but cannot see images yet.\n\n' +
          'Please describe the problem in text:\n' +
          '1. Plant (e.g. tomato, basil)\n' +
          '2. What you see (spots, wilting, insects...)\n' +
          '3. Where it grows (pot, field, greenhouse)\n' +
          '4. When it started'
      } else {
        reply = await generateReply(jid, text)
      }
    } catch (err) {
      console.error('[gateway] agent error:', err)
      reply =
        'I could not process that right now. Please try again in a moment.\n' +
        'If the problem keeps repeating, send "reset" and start a new session.'
    }

    await sock.sendPresenceUpdate('paused', jid).catch(() => {})

    for (const chunk of chunkReply(reply)) {
      const sent = await sock.sendMessage(jid, { text: chunk })
      if (sent?.key?.id) {
        sentByUs.add(sent.key.id)
        if (sentByUs.size > 500) {
          const oldest = sentByUs.values().next().value
          if (oldest) sentByUs.delete(oldest)
        }
      }
      if (chunk.length >= MAX_REPLY_CHUNK) await delay(400)
    }

    glog(`reply sent to ${jid} (${reply.length} chars)`)

    await writeAuditEntry({
      sessionId: jid,
      caseId: `${jid}:${Date.now().toString(36)}`,
      stage: 'gateway',
      status: 'info',
      input: input.slice(0, 500),
      output: { replyPreview: reply.slice(0, 300), replyLength: reply.length },
      model: MODEL,
    })
  })
}

const quietLogger = {
  level: process.env.WA_LOG_LEVEL ?? 'warn',
  child: () => quietLogger,
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: (_obj: unknown, msg?: string) => console.warn(`[baileys] ${msg ?? ''}`),
  error: (_obj: unknown, msg?: string) => console.error(`[baileys] ${msg ?? ''}`),
}

async function startGateway(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined as number[] | undefined }))

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    logger: quietLogger,
    ...(version ? { version: version as [number, number, number] } : {}),
    markOnlineOnConnect: true,
    syncFullHistory: false,
  })
  activeSocket = sock

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\nScan this QR with WhatsApp on your phone:')
      console.log('WhatsApp > Settings > Linked Devices > Link a Device\n')
      try {
        const qrPath = writeQrSvg(qr)
        if (!qrOpened) {
          qrOpened = true
          openInViewer(qrPath)
        }
        console.log(`QR image: ${qrPath} (opened in your viewer — refresh if it expires)\n`)
      } catch (err) {
        console.error('[gateway] could not write QR image:', err)
      }
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      reconnectAttempts = 0
      collectOwnJids(sock)
      glog(`WhatsApp connected as ${sock.user?.id ?? '?'} | own jids: ${[...ownJids].join(', ')}`)
      void writeAuditEntry({ sessionId: 'gateway', caseId: 'gateway', stage: 'gateway', status: 'pass', output: { event: 'connected' } })
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode
      const loggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401

      void writeAuditEntry({
        sessionId: 'gateway',
        caseId: 'gateway',
        stage: 'gateway',
        status: loggedOut ? 'fail' : 'flagged',
        output: { event: 'disconnected', statusCode },
      })

      if (loggedOut) {
        console.error('[gateway] Logged out. Delete the session folder and scan the QR again.')
        process.exit(1)
      }

      reconnectAttempts += 1
      const waitMs = Math.min(30_000, 1_000 * 2 ** reconnectAttempts)
      console.log(`[gateway] Connection closed. Reconnecting in ${waitMs / 1000}s (attempt ${reconnectAttempts})...`)
      setTimeout(() => {
        void startGateway()
      }, waitMs)
    }
  })

  sock.ev.on('messages.upsert', (event: BaileysEventMap['messages.upsert']) => {
    glog(`upsert: type=${event.type} count=${event.messages.length}`)
    if (event.type !== 'notify') return
    for (const msg of event.messages) {
      void handleMessage(sock, msg)
    }
  })

  sock.ev.on('messages.update', updates => {
    for (const u of updates) {
      if (u.update?.status !== undefined) continue
      glog(`msg update: id=${u.key?.id ?? '?'} jid=${u.key?.remoteJid ?? '?'}`)
    }
  })
}

process.on('SIGINT', () => {
  console.log('\n[gateway] Shutting down.')
  void activeSocket?.end(undefined).finally(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000)
})

process.on('unhandledRejection', err => {
  console.error('[gateway] Unhandled rejection:', err)
})

console.log('Plant Doctor WhatsApp Gateway')
console.log(`Session dir: ${SESSION_DIR}`)
console.log(`Model: ${MODEL}`)
console.log(`Groups allowed: ${ALLOW_GROUPS}`)
console.log('Commands: /reset clears conversation memory.\n')

const PROVIDER_KEYS: Record<string, string[]> = {
  openai: ['OPENAI_API_KEY'],
  google: ['GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY'],
  xai: ['XAI_API_KEY'],
  groq: ['GROQ_API_KEY'],
  openrouter: ['OPENROUTER_API_KEY'],
}

const provider = MODEL.split('/')[0]
const requiredKeys = PROVIDER_KEYS[provider] ?? [`${provider.toUpperCase()}_API_KEY`]
const hasKey = requiredKeys.some(k => process.env[k])

if (!hasKey) {
  console.error(`Missing API key for provider "${provider}". Set one of: ${requiredKeys.join(', ')} in .env`)
  console.error('Free Gemini key: https://aistudio.google.com/apikey')
  process.exit(1)
}

await startGateway()
