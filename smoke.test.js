import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('Onimai.js passes node --check', () => {
  execFileSync(process.execPath, ['--check', path.join(__dirname, 'Onimai.js')], {
    stdio: 'pipe'
  })
})

test('package.json uses current neelegirly WhatsApp stack', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))
  assert.equal(pkg.dependencies['@neelegirly/wa-api'], '1.8.4')
  assert.equal(pkg.dependencies['@neelegirly/baileys'], '2.2.18')
  assert.equal(pkg.dependencies['@neelegirly/libsignal'], '1.0.28')
})

test('README documents WhatsApp-only welcome flow', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf-8')
  assert.match(readme, /WhatsApp-only/i)
  assert.match(readme, /!welcome/i)
  assert.match(readme, /session-pair/i)
  assert.match(readme, /Onimai\.js/i)
})
