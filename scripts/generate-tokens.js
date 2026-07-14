#!/usr/bin/env node
/**
 * Token generator for Farmacia Del Niño Copa 2026
 *
 * Usage:
 *   node scripts/generate-tokens.js 100
 *
 * Format: FDN-XXXXXXXX  (8 alphanumeric chars, ~850 billion combos)
 * Charset excludes visually ambiguous chars: 0/O, 1/I/L
 *
 * Outputs:
 *   - SQL INSERT statement to stdout (paste into Supabase SQL Editor)
 *   - tokens.csv file for printing / bulk QR generation
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'  // 31 chars, no 0/O/1/I/L

const count = parseInt(process.argv[2], 10)

if (!count || isNaN(count) || count < 1 || count > 10000) {
  console.error('Usage: node scripts/generate-tokens.js <count>')
  console.error('  count must be a number between 1 and 10000')
  process.exit(1)
}

function generateToken() {
  let body = ''
  for (let i = 0; i < 8; i++) {
    body += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return `FDN-${body}`
}

const generated = new Set()
while (generated.size < count) {
  generated.add(generateToken())
}

const tokens = Array.from(generated)

// --- SQL output ---
const valueRows = tokens
  .map((code) => `  ('${code}', false)`)
  .join(',\n')

const sql = `-- Farmacia Del Niño Copa 2026 — Generated ${count} tokens on ${new Date().toISOString()}
-- Paste this into the Supabase SQL Editor and run it.

INSERT INTO tokens (code, used) VALUES
${valueRows}
ON CONFLICT (code) DO NOTHING;
`

console.log(sql)

// --- CSV output ---
const csvPath = path.join(__dirname, '..', 'tokens.csv')
const csvLines = ['code,url']
const baseUrl = process.env.BASE_URL || 'https://your-app.vercel.app'

tokens.forEach((code) => {
  csvLines.push(`${code},${baseUrl}/predict?token=${code}`)
})

fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8')
console.error(`\n✅ CSV written to: tokens.csv  (${count} tokens)`)
console.error(
  '📎 Bulk QR tool: https://www.qr-code-generator.com/qr-code-marketing/qr-codes-bulk-generator/\n'
)
