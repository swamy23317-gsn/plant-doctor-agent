# Plant Doctor

An AI agent that diagnoses plant-growth problems for farmers and home gardeners. Describe the symptoms in plain language (or chat on WhatsApp) and get a structured, tool-grounded diagnosis with immediate actions, prevention tips, and watch-fors — built on the **Mastra** AI framework (TypeScript/Node).

## Features

- **Structured diagnosis pipeline** — intake extraction → tool-grounded diagnosis → verification (with one remediation retry) → audit trail
- **Plant knowledge base** — 19 plant problems, 7 care guides, 6 seasonal task sets, searched via keyword-scored tools
- **Verification stage** — a separate verifier agent checks the diagnosis against the case intake and passes/fails it
- **Full audit trail** — every stage appended to `audit/diagnosis-log.jsonl`
- **WhatsApp gateway** — talk to the agent from your phone via WhatsApp Web QR pairing (Baileys). No WhatsApp Business API or Meta account needed
- **Per-customer memory** — each WhatsApp chat gets its own conversation thread persisted in LibSQL
- **Free-tier LLM** — runs on Google Gemini's free tier by default (`google/gemini-3.5-flash-lite`), any Mastra-supported model works via one env var

## Requirements

- Node.js 24+ (runs `.ts` directly, no build step)
- A Google Gemini API key — free at https://aistudio.google.com/apikey

## Setup

```bash
git clone https://github.com/swamy23317-gsn/plant-doctor-agent.git
cd plant-doctor-agent
npm install
cp .env.example .env
# edit .env and paste your GOOGLE_API_KEY
```

`.env`:

```ini
GOOGLE_API_KEY=your-gemini-api-key-here
MASTRA_MODEL=google/gemini-3.5-flash-lite
WA_SESSION_DIR=.wa-session
WA_ALLOW_GROUPS=false
```

## Usage

| Command | What it does |
|---|---|
| `npm run chat` | Interactive terminal chat with the agent |
| `npm run diagnose` | Runs the full workflow on a sample case and prints the report |
| `npm run diagnose -- "your symptom description"` | Same, with your own case text |
| `npm run gateway` | Starts the WhatsApp gateway (shows a QR code to scan) |
| `npm run dev` | Starts Mastra Studio on http://localhost:4111 (playground + traces) |
| `npm run typecheck` | TypeScript type check |

## WhatsApp setup

1. Run `npm run gateway`
2. A QR code opens in your viewer (also written to `whatsapp-qr.svg`, and shown in the terminal)
3. On your phone: **WhatsApp → Settings → Linked Devices → Link a Device** → scan the QR
4. Send messages to the agent:
   - **Message yourself** (your own chat) to test from one phone
   - Anyone who messages your number will get replies
   - Send `/reset` to start a fresh conversation
   - Photos without captions get a guided prompt to describe the symptoms in text

The session is stored in `.wa-session/` — you only scan the QR once; later restarts reconnect automatically.

## How it works

```
message → intake extractor (structured case: plant, symptom, context…)
              ↓
        plant-doctor agent → knowledge-base search tools
              ↓
        verifier agent → pass / fail (+ one remediation retry)
              ↓
        final answer + audit entry (JSONL)
```

- **`plant-doctor`** — the main agent; follows a 4-phase diagnostic protocol and escalation rules, uses `search-problems`, `care-guide`, and `seasonal-guide` tools
- **`case-extractor`** — turns free text into a structured intake object
- **`diagnosis-workflow`** — the Mastra workflow that chains the stages and retries on verification failure

## Project structure

```
src/
├── mastra/
│   ├── index.ts                 Mastra instance (agents, workflow, storage)
│   ├── agents/
│   │   ├── plant-agent.ts       main diagnostic agent
│   │   └── extractor-agent.ts   intake extractor (structured output)
│   ├── workflows/
│   │   └── diagnosis-workflow.ts extract → diagnose → verify → finalize
│   ├── tools/
│   │   ├── search-problems-tool.ts  knowledge-base search
│   │   └── care-tools.ts            care + seasonal guides
│   └── lib/
│       ├── knowledge-base.ts    19 problems, care/seasonal guides
│       ├── schemas.ts           Zod schemas (intake, diagnosis, verification)
│       ├── audit.ts             JSONL audit writer
│       └── db.ts                LibSQL database path
├── gateway/
│   ├── whatsapp.ts              Baileys WhatsApp gateway
│   └── qr-svg.ts                QR code → SVG image renderer
├── cli.ts                       interactive chat
├── run-diagnosis.ts             one-shot diagnosis runner
├── smoke-test.ts                knowledge-base tests
└── load-env.ts                  .env loader
```

## Switching models

Any Mastra-supported `provider/model` works — set `MASTRA_MODEL` in `.env`:

```ini
MASTRA_MODEL=google/gemini-2.5-flash        # Google
MASTRA_MODEL=openai/gpt-4o-mini             # OpenAI (needs OPENAI_API_KEY)
MASTRA_MODEL=anthropic/claude-haiku-4-5     # Anthropic (needs ANTHROPIC_API_KEY)
```

## Notes & limitations

- **WhatsApp uses the unofficial WhatsApp Web protocol** (Baileys). It works well for low/medium volume but is not Meta-official — at high volume WhatsApp may flag the linked number. For production scale, migrate to the official WhatsApp Business API (the gateway is isolated in `src/gateway/whatsapp.ts`).
- Photos are not analyzed yet — the agent asks for a text description of symptoms.
- Keep `.env` and `.wa-session/` private; both are git-ignored. Never commit API keys or WhatsApp session data.

## License

Private project.
