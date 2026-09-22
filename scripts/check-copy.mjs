#!/usr/bin/env node
// R1: no em dash, en dash, or " - " in user facing copy. §10.7.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DASH_RE = /—|–| - /
const HYPHEN_WORD_RE = /[A-Za-z]-[A-Za-z]/

let failed = false

function scanWholeFile(path) {
  if (!existsSync(path)) return
  const lines = readFileSync(path, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (DASH_RE.test(line)) {
      console.error(`${path}:${i + 1}: ${line.trim()}`)
      failed = true
    }
  })
}

// copy.ts and seed.json are almost entirely string literals/values, so a whole-line scan is reliable.
scanWholeFile(join(root, 'src/copy.ts'))
scanWholeFile(join(root, 'plan/seed.json'))

// slides.tsx: deck prose lives in plain data objects (title/body/notes/callouts) at the top of the
// file, rendered via {expr}, per §10.7's own suggested shape. So scan every string literal VALUE in
// the file (single/double/template quoted), not just JSX text nodes — that's where the real prose
// is, and it's also where a hyphenated word regression ("one-click", "next-day") would actually hide.
const slidesPath = join(root, 'src/deck/slides.tsx')
if (existsSync(slidesPath)) {
  const lines = readFileSync(slidesPath, 'utf8').split('\n')
  const STRING_LITERAL_RE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g
  lines.forEach((line, i) => {
    if (/^\s*import /.test(line) || /\bfrom\s+['"]/.test(line)) return
    if (/className=|style=|\bid=|\bkey=|data-[\w-]+=/.test(line)) return
    for (const m of line.matchAll(STRING_LITERAL_RE)) {
      const text = m[0].slice(1, -1)
      // CSS custom properties are explicitly exempt (§10.7); URLs are identifiers, not prose.
      if (/^var\(--[\w-]+\)$/.test(text) || /^--[\w-]+$/.test(text) || /^https?:\/\//.test(text)) continue
      if (DASH_RE.test(text)) {
        console.error(`${slidesPath}:${i + 1}: ${line.trim()}`)
        failed = true
      }
      if (HYPHEN_WORD_RE.test(text)) {
        console.error(`${slidesPath}:${i + 1} (hyphenated word): ${line.trim()}`)
        failed = true
      }
    }
  })
}

if (failed) {
  console.error('\ncheck:copy failed. Remove dashes from user facing copy (R1).')
  process.exit(1)
} else {
  console.log('check:copy passed.')
}
