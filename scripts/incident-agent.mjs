#!/usr/bin/env node
/**
 * 🤖 Incident Response Agent
 * ─────────────────────────────────────────────────────────────
 * Dijalankan otomatis oleh GitHub Actions saat CI pipeline gagal.
 * Agent ini akan:
 *   1. Mengumpulkan konteks failure (branch, commit, author, logs)
 *   2. Melakukan root cause analysis sederhana berdasarkan pola error
 *   3. Mengirim laporan terstruktur ke Telegram Dev Bot
 *
 * Usage:
 *   node scripts/incident-agent.mjs [--test]
 *
 * Environment Variables (diisi oleh GitHub Actions):
 *   TELEGRAM_DEV_BOT_TOKEN  - Token bot Telegram khusus dev
 *   TELEGRAM_DEV_CHAT_ID    - Chat ID developer / grup dev
 *   GITHUB_REPOSITORY       - e.g. "ambardws/dompetku"
 *   GITHUB_RUN_ID           - ID run Actions saat ini
 *   GITHUB_SHA              - Full commit SHA
 *   GITHUB_REF_NAME         - Branch name
 *   GITHUB_ACTOR            - Username yang trigger CI
 *   GITHUB_EVENT_NAME       - "push" | "pull_request"
 *   CI_JOB_NAME             - Nama job yang gagal
 *   CI_FAILURE_LOGS         - Log error (opsional, max 3000 chars)
 *   CI_FAILURE_PHASE        - "test" | "build" | "sonar" | "deploy"
 */

// ─── Config ──────────────────────────────────────────────────
const BOT_TOKEN    = process.env.TELEGRAM_DEV_BOT_TOKEN
const CHAT_ID      = process.env.TELEGRAM_DEV_CHAT_ID
const IS_TEST_MODE = process.argv.includes('--test')

// ─── GitHub Context ───────────────────────────────────────────
const ctx = {
  repo:        process.env.GITHUB_REPOSITORY       || 'ambardws/dompetku',
  runId:       process.env.GITHUB_RUN_ID            || '0',
  sha:         process.env.GITHUB_SHA               || 'abc1234',
  branch:      process.env.GITHUB_REF_NAME          || 'main',
  actor:       process.env.GITHUB_ACTOR             || 'developer',
  eventName:   process.env.GITHUB_EVENT_NAME        || 'push',
  jobName:     process.env.CI_JOB_NAME              || 'test-and-analyze',
  failureLogs: process.env.CI_FAILURE_LOGS          || '',
  failurePhase:process.env.CI_FAILURE_PHASE         || 'unknown',
}

// ─── Root Cause Analysis Patterns ────────────────────────────
const ERROR_PATTERNS = [
  {
    id: 'test_fail',
    phase: 'test',
    patterns: [/FAIL\s+src\//i, /AssertionError/i, /Expected.*received/i, /× .+\.test\.ts/i],
    emoji: '🧪',
    label: 'Unit Test Gagal',
    suggestion: 'Periksa perubahan terakhir pada file yang dites. Jalankan `npm run test` lokal untuk detail.',
  },
  {
    id: 'type_error',
    phase: 'test',
    patterns: [/TypeScript.*error/i, /TS\d{4}:/i, /Type.*is not assignable/i, /Property.*does not exist/i],
    emoji: '🔴',
    label: 'TypeScript Error',
    suggestion: 'Ada type mismatch. Jalankan `npx nuxt typecheck` atau cek import/interface yang berubah.',
  },
  {
    id: 'import_error',
    phase: 'test',
    patterns: [/Cannot find module/i, /ERR_MODULE_NOT_FOUND/i, /Failed to resolve/i, /ENOENT.*\.ts/i],
    emoji: '📦',
    label: 'Import / Module Error',
    suggestion: 'Ada file yang di-import tapi tidak ditemukan. Cek rename/delete file terbaru.',
  },
  {
    id: 'build_fail',
    phase: 'build',
    patterns: [/nuxt build.*failed/i, /Build failed/i, /Nitro.*error/i, /vite.*build.*error/i],
    emoji: '🏗️',
    label: 'Build Gagal',
    suggestion: 'Jalankan `npm run build` lokal. Kemungkinan ada syntax error atau config yang salah.',
  },
  {
    id: 'sonar_gate',
    phase: 'sonar',
    patterns: [/Quality Gate.*FAILED/i, /SonarCloud.*failed/i, /coverage.*below.*threshold/i],
    emoji: '🔍',
    label: 'SonarCloud Quality Gate Gagal',
    suggestion: 'Coverage turun atau ada code smell baru. Cek dashboard SonarCloud untuk detail.',
  },
  {
    id: 'npm_install',
    phase: 'test',
    patterns: [/npm ci.*failed/i, /npm ERR!/i, /peer dep.*conflict/i, /ERESOLVE/i],
    emoji: '📦',
    label: 'npm Install Error',
    suggestion: 'Dependency conflict. Cek apakah package.json baru di-update tanpa `npm ci` yang bersih.',
  },
  {
    id: 'timeout',
    patterns: [/Timeout.*exceeded/i, /Test timed out/i, /exceeded.*timeout/i],
    emoji: '⏱️',
    label: 'Test Timeout',
    suggestion: 'Ada test yang berjalan terlalu lama. Cek operasi async yang tidak di-mock dengan benar.',
  },
  {
    id: 'env_missing',
    patterns: [/SUPABASE_URL.*undefined/i, /Missing.*env/i, /process\.env\.\w+.*undefined/i],
    emoji: '🔐',
    label: 'Environment Variable Hilang',
    suggestion: 'Tambahkan secret yang dibutuhkan ke GitHub Repository Secrets.',
  },
]

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Analisa log error dan kembalikan root cause yang paling relevan
 */
function analyzeRootCause(logs, phase) {
  if (!logs) return null

  // Cari pattern yang cocok, prioritaskan yang sesuai phase
  const phaseMatches = []
  const generalMatches = []

  for (const pattern of ERROR_PATTERNS) {
    const matched = pattern.patterns.some(p => p.test(logs))
    if (!matched) continue

    if (pattern.phase === phase) {
      phaseMatches.push(pattern)
    } else if (!pattern.phase) {
      generalMatches.push(pattern)
    } else {
      generalMatches.push(pattern)
    }
  }

  return phaseMatches[0] || generalMatches[0] || null
}

/**
 * Ekstrak baris error paling relevan dari log (max N baris)
 */
function extractErrorSnippet(logs, maxLines = 8) {
  if (!logs) return null

  const lines = logs.split('\n')
  const errorLines = lines.filter(line =>
    /error|FAIL|failed|assert|×|✗|TypeError|Cannot/i.test(line) &&
    !/^\s*$/.test(line)
  )

  const snippet = errorLines.slice(0, maxLines).join('\n')
  return snippet.length > 0 ? snippet.substring(0, 800) : null
}

/**
 * Format angka SHA menjadi pendek
 */
function shortSha(sha) {
  return sha.substring(0, 7)
}

/**
 * Buat URL ke GitHub Actions run
 */
function buildRunUrl() {
  return `https://github.com/${ctx.repo}/actions/runs/${ctx.runId}`
}

/**
 * Buat URL ke commit
 */
function buildCommitUrl() {
  return `https://github.com/${ctx.repo}/commit/${ctx.sha}`
}

/**
 * Format phase menjadi label yang readable
 */
function formatPhase(phase) {
  const labels = {
    test:   '🧪 Testing',
    build:  '🏗️ Build',
    sonar:  '🔍 SonarCloud',
    deploy: '🚀 Deploy',
    unknown:'❓ Unknown',
  }
  return labels[phase] || `❓ ${phase}`
}

// ─── Message Builder ──────────────────────────────────────────

function buildMessage() {
  const rootCause = analyzeRootCause(ctx.failureLogs, ctx.failurePhase)
  const errorSnippet = extractErrorSnippet(ctx.failureLogs)
  const runUrl = buildRunUrl()
  const commitUrl = buildCommitUrl()
  const isPR = ctx.eventName === 'pull_request'

  const lines = []

  // Header
  lines.push(`🚨 <b>CI/CD INCIDENT ALERT</b>`)
  lines.push(``)

  // Info dasar
  lines.push(`📁 <b>Repo:</b> <code>${ctx.repo}</code>`)
  lines.push(`🌿 <b>Branch:</b> <code>${ctx.branch}</code>`)
  lines.push(`👤 <b>Triggered by:</b> @${ctx.actor}${isPR ? ' (PR)' : ' (push)'}`)
  lines.push(`💥 <b>Failed at:</b> ${formatPhase(ctx.failurePhase)}`)
  lines.push(`🔗 <b>Commit:</b> <a href="${commitUrl}"><code>${shortSha(ctx.sha)}</code></a>`)
  lines.push(``)

  // Root Cause Analysis
  if (rootCause) {
    lines.push(`─────────────────────────`)
    lines.push(`${rootCause.emoji} <b>Root Cause Analysis</b>`)
    lines.push(`<b>Kategori:</b> ${rootCause.label}`)
    lines.push(``)
    lines.push(`💡 <b>Saran:</b>`)
    lines.push(`${rootCause.suggestion}`)
    lines.push(``)
  } else {
    lines.push(`─────────────────────────`)
    lines.push(`🔎 <b>Root Cause:</b> Tidak dapat diidentifikasi otomatis`)
    lines.push(`Periksa log lengkap di GitHub Actions.`)
    lines.push(``)
  }

  // Error snippet
  if (errorSnippet) {
    lines.push(`─────────────────────────`)
    lines.push(`📋 <b>Error Log (snippet):</b>`)
    lines.push(`<pre>${escapeHtml(errorSnippet)}</pre>`)
    lines.push(``)
  }

  // Actions
  lines.push(`─────────────────────────`)
  lines.push(`🔗 <a href="${runUrl}">Lihat Full Log di GitHub Actions</a>`)

  // Footer timestamp
  const now = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'short',
    timeStyle: 'short',
  })
  lines.push(``)
  lines.push(`⏰ ${now} WIB`)

  return lines.join('\n')
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ─── Telegram Sender ──────────────────────────────────────────

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const payload = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!result.ok) {
    throw new Error(`Telegram API error: ${result.description}`)
  }

  return result
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('🤖 Incident Response Agent starting...')
  console.log('📊 Context:', {
    repo:         ctx.repo,
    branch:       ctx.branch,
    actor:        ctx.actor,
    failurePhase: ctx.failurePhase,
    sha:          shortSha(ctx.sha),
  })

  // Test mode: gunakan dummy data
  if (IS_TEST_MODE) {
    console.log('\n🧪 Running in TEST MODE...')
    ctx.failureLogs = 'FAIL src/modules/transactions/application/use-cases/AddTransactionUseCase.test.ts\n× should create transaction with valid input\nAssertionError: Expected 1 received 0\n'
    ctx.failurePhase = 'test'
    ctx.sha = 'abc1234567890'
    ctx.actor = 'ambar'
    ctx.branch = 'develop'
    console.log('📋 Using dummy failure logs for test...\n')
  }

  // Validasi config
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Error: TELEGRAM_DEV_BOT_TOKEN dan TELEGRAM_DEV_CHAT_ID harus diset!')
    console.error('   Set di .env untuk lokal, atau GitHub Secrets untuk CI.')
    if (!IS_TEST_MODE) process.exit(1)
    return
  }

  try {
    const message = buildMessage()

    console.log('\n📨 Message preview:')
    console.log('─'.repeat(50))
    console.log(message.replace(/<[^>]+>/g, '')) // strip HTML for console
    console.log('─'.repeat(50))

    await sendTelegramMessage(message)
    console.log('\n✅ Incident alert berhasil dikirim ke Telegram Dev Bot!')
  } catch (error) {
    console.error('\n❌ Gagal mengirim alert:', error.message)
    process.exit(1)
  }
}

main()
