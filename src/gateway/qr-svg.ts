import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const QRCode = require('qrcode-terminal/vendor/QRCode')
const ErrorCorrectLevel = require('qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel')

export function renderQrSvg(text: string): string {
  const qr = new QRCode(-1, ErrorCorrectLevel.L)
  qr.addData(text)
  qr.make()

  const count: number = qr.getModuleCount()
  const quiet = 4
  const size = count + quiet * 2
  const modulePx = Math.max(6, Math.round(480 / size))

  const parts: string[] = []
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules[row][col]) {
        parts.push(`<rect x="${col + quiet}" y="${row + quiet}" width="1" height="1"/>`)
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size * modulePx}" height="${size * modulePx}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
<rect width="${size}" height="${size}" fill="#ffffff"/>
<g fill="#000000">${parts.join('')}</g>
</svg>
`
}

export function writeQrSvg(text: string, filePath = 'whatsapp-qr.svg'): string {
  const abs = resolve(filePath)
  writeFileSync(abs, renderQrSvg(text), 'utf8')
  return abs
}

export function openInViewer(filePath: string): void {
  const cmd =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', filePath]]
      : process.platform === 'darwin'
        ? ['open', [filePath]]
        : ['xdg-open', [filePath]]

  try {
    const child = spawn(cmd[0] as string, cmd[1] as string[], { stdio: 'ignore', detached: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // viewer unavailable — file path is still printed
  }
}
