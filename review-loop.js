#!/usr/bin/env node
// review-loop.js — Review + Fix via claude CLI (OAuth, pas d'API key)
// Usage: node review-loop.js

const { spawnSync } = require('child_process')
const fs   = require('fs')
const path = require('path')

const PROJECT    = path.resolve(__dirname)
const LOG        = path.join(PROJECT, 'review-loop.log')
const REVIEW_MD  = path.join(PROJECT, 'REVIEW.md')
const FIX_MD     = path.join(PROJECT, 'REVIEW-FIX.md')
const DURATION_H = 3
const INTERVAL_M = 15

let iteration = 0
const endTime = Date.now() + DURATION_H * 60 * 60 * 1000

function log(msg) {
  const ts   = new Date().toLocaleTimeString('fr-FR')
  const line = `[${ts}] ${msg}`
  console.log(line)
  fs.appendFileSync(LOG, line + '\n', 'utf8')
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function askClaude(prompt) {
  try {
    // Supprimer ANTHROPIC_API_KEY pour forcer l'auth OAuth keychain
    const env = { ...process.env }
    delete env.ANTHROPIC_API_KEY

    const result = spawnSync('claude', [
      '--print',
      '--dangerously-skip-permissions',
      '--model', 'claude-opus-4-6',
    ], {
      input: prompt,
      encoding: 'utf8',
      cwd: PROJECT,
      env,
      maxBuffer: 20 * 1024 * 1024,
      timeout: 5 * 60 * 1000,
    })
    if (result.error) { log('CLI ERROR: ' + result.error.message); return '' }
    if (result.status !== 0) { log('CLI STDERR: ' + (result.stderr || '').slice(0, 200)); return '' }
    return result.stdout || ''
  } catch (e) {
    log('CLI EXCEPTION: ' + e.message)
    return ''
  }
}

function readSrcFiles() {
  const extensions = ['.ts', '.tsx', '.js']
  const ignore = ['node_modules', '.next', 'dist', '.git']
  const files = []

  function walk(dir) {
    try {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (ignore.some(ig => full.includes(ig))) continue
        const stat = fs.statSync(full)
        if (stat.isDirectory()) { walk(full); continue }
        if (extensions.includes(path.extname(entry))) {
          try {
            const content = fs.readFileSync(full, 'utf8')
            const rel = path.relative(PROJECT, full)
            files.push({ path: rel, content: content.slice(0, 3000) })
          } catch {}
        }
      }
    } catch {}
  }

  walk(path.join(PROJECT, 'src'))
  return files
}

function runReview() {
  log('-> Lecture du codebase...')
  const files = readSrcFiles()
  log(`-> ${files.length} fichiers lus`)

  const filesSummary = files.map(f =>
    `\n\n### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
  ).join('')

  const prompt = `Tu es un expert en securite et qualite code pour Next.js/Prisma/TypeScript.
Analyse ce codebase Momento (marketplace evenementiel).

FICHIERS:
${filesSummary}

Produis un rapport au format suivant (STRICT):

---
status: findings
iteration: ${iteration}
reviewed_at: ${new Date().toISOString()}
critical: <N>
warning: <N>
info: <N>
---

Pour chaque probleme:
### [CRITICAL/WARNING/INFO] ID — titre
**Fichier:** chemin:ligne
**Probleme:** description
**Fix:** solution concrete

Categories:
- CRITICAL: IDOR, auth manquante, injections, data leaks, race conditions
- WARNING: N+1 Prisma, validation absente, catch silencieux, XSS
- INFO: dead code, naming, perf mineure

Sois exhaustif.`

  log('-> Envoi au modele (review)...')
  const result = askClaude(prompt)
  if (result && result.length > 100) {
    fs.writeFileSync(REVIEW_MD, result, 'utf8')
    log(`OK Review ecrit (${result.length} chars)`)
  } else {
    log('WARN Review vide ou trop court')
  }
}

function runFix() {
  if (!fs.existsSync(REVIEW_MD)) { log('SKIP fix: REVIEW.md absent'); return }

  const review = fs.readFileSync(REVIEW_MD, 'utf8')
  const criticals = (review.match(/### \[CRITICAL\]/g) || []).length
  const warnings  = (review.match(/### \[WARNING\]/g) || []).length
  log(`-> ${criticals} CRITICAL + ${warnings} WARNING a fixer`)

  const prompt = `Tu es un expert en correction de bugs Next.js/TypeScript/Prisma.
Voici un rapport de code review. Pour chaque finding CRITICAL et WARNING, genere le fix MINIMAL.

REVIEW:
${review}

Reponds avec un JSON array UNIQUEMENT (pas de markdown, pas d'explication):
[
  {
    "id": "CR-001",
    "file": "src/app/api/...",
    "description": "ce qui est change",
    "find": "code exact verbatim a remplacer (court, unique dans le fichier)",
    "replace": "code corrige"
  }
]`

  log('-> Envoi au modele (fix)...')
  const result = askClaude(prompt)

  let fixes = []
  let applied = 0
  let failed  = 0
  const fixLog = []

  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    if (jsonMatch) fixes = JSON.parse(jsonMatch[0])
  } catch (e) {
    log('WARN parse JSON: ' + e.message)
  }

  for (const fix of fixes) {
    if (!fix.file || !fix.find || !fix.replace) continue
    const filePath = path.join(PROJECT, fix.file)
    if (!fs.existsSync(filePath)) { failed++; fixLog.push(`[SKIP] ${fix.id} — fichier absent: ${fix.file}`); continue }

    try {
      let content = fs.readFileSync(filePath, 'utf8')
      if (content.includes(fix.find)) {
        content = content.replace(fix.find, fix.replace)
        fs.writeFileSync(filePath, content, 'utf8')
        applied++
        fixLog.push(`[APPLIED] ${fix.id} — ${fix.file}: ${fix.description}`)
        log(`  FIX ${fix.id}: ${fix.file}`)
      } else {
        failed++
        fixLog.push(`[SKIP] ${fix.id} — pattern non trouve dans ${fix.file}`)
      }
    } catch (e) {
      failed++
      fixLog.push(`[ERROR] ${fix.id} — ${e.message}`)
    }
  }

  const fixReport = `---
iteration: ${iteration}
fixed: ${applied}
skipped: ${failed}
fixed_at: ${new Date().toISOString()}
---

# Fix Report — Iteration ${iteration}

${fixLog.join('\n')}
`
  fs.writeFileSync(FIX_MD, fixReport, 'utf8')
  log(`OK ${applied} fixes appliques, ${failed} skips`)
}

async function main() {
  fs.writeFileSync(LOG, '', 'utf8')
  log(`=== REVIEW LOOP START — fin prevue ${new Date(endTime).toLocaleTimeString('fr-FR')} ===`)
  log(`Projet: ${PROJECT}`)
  log(`Interval: ${INTERVAL_M}min | Duree: ${DURATION_H}h`)

  while (Date.now() < endTime) {
    iteration++
    log('')
    log(`--- ITERATION ${iteration} (${new Date().toLocaleTimeString('fr-FR')}) ---`)

    runReview()
    runFix()

    const remaining = Math.round((endTime - Date.now()) / 60000)
    log(`Pause ${INTERVAL_M}min — ${remaining}min restantes`)

    if (Date.now() + INTERVAL_M * 60 * 1000 < endTime) {
      await sleep(INTERVAL_M * 60 * 1000)
    } else {
      log('Derniere iteration.')
      break
    }
  }

  log(`=== LOOP TERMINE — ${iteration} iterations completees ===`)
}

main().catch(e => log('FATAL: ' + e.message))
