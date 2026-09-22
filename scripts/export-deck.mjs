#!/usr/bin/env node
// Builds the app, serves it, and exports the deck: one PNG per slide, composed into one PDF. §10.5.
//
// The PDF is built by embedding each slide's own PNG onto its own 1920x1080 page with pdf-lib,
// rather than relying on page.pdf() to paginate a tall stacked print view via CSS break-after.
// That approach was tried first and produced 8 PDF pages for 27 slides (Chromium's print
// pagination did not honor the break points reliably at this page size) while the per-slide PNG
// screenshots were already exact, so composing the PDF from those same PNGs sidesteps the
// unreliable part entirely and guarantees one page per slide.
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'
import { PDFDocument } from 'pdf-lib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4173
const BASE = `http://localhost:${PORT}`

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32', ...opts })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))))
  })
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url)
        if (res.ok) return resolve()
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`Timed out waiting for ${url}`))
      setTimeout(tick, 300)
    }
    tick()
  })
}

async function main() {
  console.log('Building...')
  await run('npx', ['vite', 'build'])

  console.log('Starting preview server...')
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })

  try {
    await waitForServer(BASE)

    const slidesDir = join(root, 'exports/slides')
    mkdirSync(slidesDir, { recursive: true })

    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
    await page.goto(`${BASE}/deck/print`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500) // let the QR code data URL resolve on the last slide

    console.log('Exporting per slide PNGs...')
    const slides = await page.locator('.deck-print-slide').all()
    const pngPaths = []
    for (let i = 0; i < slides.length; i++) {
      const n = String(i + 1).padStart(2, '0')
      const p = join(slidesDir, `slide-${n}.png`)
      await slides[i].screenshot({ path: p })
      pngPaths.push(p)
    }
    await browser.close()

    console.log('Composing PDF from the slide PNGs...')
    const pdf = await PDFDocument.create()
    for (const p of pngPaths) {
      const png = await pdf.embedPng(readFileSync(p))
      const pdfPage = pdf.addPage([1920, 1080])
      pdfPage.drawImage(png, { x: 0, y: 0, width: 1920, height: 1080 })
    }
    const pdfBytes = await pdf.save()
    const { writeFileSync } = await import('node:fs')
    writeFileSync(join(root, 'exports/relay-deck.pdf'), pdfBytes)

    console.log(`Done. ${pngPaths.length} slides exported to exports/slides/, and exports/relay-deck.pdf.`)
  } finally {
    preview.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
