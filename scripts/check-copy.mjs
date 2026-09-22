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

// slides.tsx: only scan JSX text nodes (between `>` and `<`), skipping attribute/import lines,
// and also fail on hyphenated words there. Deck prose lives in plain data objects (title/body/notes/
// callouts) rendered via {expr}, so this rarely fires; it exists as a real backstop, not a formality.
const slidesPath = join(root, 'src/deck/slides.tsx')
if (existsSync(slidesPath)) {
  const lines = readFileSync(slidesPath, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (/className=|style=|\bid=|\bkey=|data-[\w-]+=|from ['"]|^\s*import /.test(line)) return
    for (const m of line.matchAll(/>([^<>{}]+)</g)) {
      const text = m[1]
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
