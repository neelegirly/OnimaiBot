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
  assert.equal(pkg.name, 'onimaibasev3')
  assert.equal(pkg.main, 'Onimai.js')
  assert.equal(pkg.dependencies['@neelegirly/wa-api'], '1.8.4')
  assert.equal(pkg.dependencies['@neelegirly/baileys'], '2.2.18')
  assert.equal(pkg.dependencies['@neelegirly/libsignal'], '1.0.28')
  assert.match(pkg.scripts['pm2:start'], /ecosystem\.config\.js/)
  assert.match(pkg.scripts['pm2:start'], /OnimaiBaseV3/)
})

test('README documents WhatsApp-only welcome flow and PM2 setup', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf-8')
  assert.match(readme, /WhatsApp-only/i)
  assert.match(readme, /!welcome/i)
  assert.match(readme, /Kick/i)
  assert.match(readme, /Banner/i)
  assert.match(readme, /pm2:start/i)
  assert.match(readme, /session-pair/i)
  assert.match(readme, /Onimai\.js/i)
})

test('event config and sendOnimai naming are documented in files', () => {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf-8')
  const source = fs.readFileSync(path.join(__dirname, 'Onimai.js'), 'utf-8')
  const ecosystem = fs.readFileSync(path.join(__dirname, 'ecosystem.config.js'), 'utf-8')

  for (const key of [
    'DISCORD_TOKEN=',
    'CLIENT_ID=',
    'GUILD_ID=',
    'WELCOME_CHANNEL_ID=',
    'LEAVE_CHANNEL_ID=',
    'KICK_LOG_CHANNEL_ID=',
    'WELCOME_BANNER_URL=',
    'LEAVE_BANNER_URL=',
    'KICK_BANNER_URL='
  ]) {
    assert.match(envExample, new RegExp(key))
  }

  assert.match(source, /const sendOnimai = async/)
  assert.doesNotMatch(source, /sendTextMessage/)
  assert.match(ecosystem, /OnimaiBaseV3/)
  assert.match(ecosystem, /\.\/logs\/OnimaiBaseV3/)
})
