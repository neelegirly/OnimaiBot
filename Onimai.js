// OnimaiBot powered by Neelegirly ✨
// Single-file WhatsApp Multi-Session Base für OnimaiBase 💜

import onimai from '@neelegirly/wa-api'
import { WAMessageStubType } from '@neelegirly/baileys'
import boxen from 'boxen'
import chalk from 'chalk'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const TZ = 'Europe/Berlin'
const SAVE_INTERVAL_MS = 5 * 60 * 1000
const DEFAULT_SESSION_NAME = 'main-session'
const BOOT_AT = Date.now()
const OWNER_FILE_PATH = path.join(__dirname, 'owner.json')
const DB_FILE_PATH = path.join(__dirname, 'database.json')
const PACKAGE_FILE_PATH = path.join(__dirname, 'package.json')

const packageMeta = JSON.parse(fs.readFileSync(PACKAGE_FILE_PATH, 'utf-8'))

const DEFAULT_WELCOME_TEMPLATE = '🌸 Willkommen @user in *@subject*!\n\n📖 Beschreibung: @desc\n👥 Mitglieder: @count\n🤖 Session: @session'
const DEFAULT_GOODBYE_TEMPLATE = '💫 Tschüss @user aus *@subject*!\n\nWir wünschen dir alles Liebe.\n👥 Restliche Mitglieder: @count\n🤖 Session: @session'

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'ja', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'nein', 'off'].includes(normalized)) return false
  return fallback
}

const parseInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const splitCommaList = (value) => String(value ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)

const unique = (values = []) => [...new Set(values.filter(Boolean))]

const extractDigits = (value = '') => String(value ?? '').replace(/\D/g, '')

const normalizeJid = (value = '') => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (raw.includes('@')) return raw
  const digits = extractDigits(raw)
  return digits ? `${digits}@s.whatsapp.net` : raw
}

const normalizeMentionList = (participants = []) => unique(
  (Array.isArray(participants) ? participants : [participants])
    .map((entry) => {
      if (!entry) return ''
      if (typeof entry === 'string') return normalizeJid(entry)
      if (typeof entry?.id === 'string') return normalizeJid(entry.id)
      if (typeof entry?.jid === 'string') return normalizeJid(entry.jid)
      if (typeof entry?.participant === 'string') return normalizeJid(entry.participant)
      if (entry?.id && typeof entry.id === 'object' && typeof entry.id.user === 'string' && typeof entry.id.server === 'string') {
        return `${entry.id.user}@${entry.id.server}`
      }
      if (entry?.jid && typeof entry.jid === 'object' && typeof entry.jid.user === 'string' && typeof entry.jid.server === 'string') {
        return `${entry.jid.user}@${entry.jid.server}`
      }
      return ''
    })
)

const normalizeSessionName = (value = '') => String(value ?? '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9._-]/g, '')

const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const buildDefaultDatabase = () => ({
  meta: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: packageMeta.version || '0.0.0'
  },
  users: {},
  groups: {},
  sessions: {},
  settings: {
    prefix: process.env.BOT_PREFIX || '!'
  },
  stats: {
    totalMessages: 0,
    totalCommands: 0,
    totalWelcomes: 0,
    totalGoodbyes: 0,
    commandUsage: {}
  }
})

const mergeDatabaseDefaults = (data = {}) => {
  const defaults = buildDefaultDatabase()
  return {
    ...defaults,
    ...data,
    meta: {
      ...defaults.meta,
      ...(data.meta || {})
    },
    users: data.users || {},
    groups: data.groups || {},
    sessions: data.sessions || {},
    settings: {
      ...defaults.settings,
      ...(data.settings || {})
    },
    stats: {
      ...defaults.stats,
      ...(data.stats || {}),
      commandUsage: {
        ...defaults.stats.commandUsage,
        ...((data.stats || {}).commandUsage || {})
      }
    }
  }
}

if (!fs.existsSync(DB_FILE_PATH)) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(buildDefaultDatabase(), null, 2))
}

const adapter = new JSONFile(DB_FILE_PATH)
const db = new Low(adapter, buildDefaultDatabase())
await db.read()
db.data = mergeDatabaseDefaults(db.data)
global.db = db

const saveDatabase = async () => {
  global.db.data.meta.updatedAt = Date.now()
  await global.db.write()
}

const saveInterval = setInterval(() => {
  saveDatabase().catch((error) => {
    console.error('❌ Fehler beim Speichern der Datenbank:', error)
  })
}, SAVE_INTERVAL_MS)
saveInterval.unref?.()

const defaultOwnerConfig = {
  ownerName: 'Neele',
  ownerNumber: '491234567890@s.whatsapp.net',
  regName: 'OnimaiBot',
  ownerTag: '🌸 Owner',
  ownerContact: 'https://wa.me/491234567890'
}

let ownerConfig = { ...defaultOwnerConfig }
if (fs.existsSync(OWNER_FILE_PATH)) {
  try {
    ownerConfig = {
      ...ownerConfig,
      ...JSON.parse(fs.readFileSync(OWNER_FILE_PATH, 'utf-8'))
    }
  } catch (error) {
    console.warn('⚠️ owner.json konnte nicht gelesen werden, Standardwerte werden genutzt.', error)
  }
}

const envOwnerNumbers = splitCommaList(process.env.BOT_OWNER_NUMBERS).map(normalizeJid)
const ownerNumbers = unique([ownerConfig.ownerNumber, ...envOwnerNumbers].map(normalizeJid))
const primaryOwnerDigits = extractDigits(ownerNumbers[0] || ownerConfig.ownerNumber)

const runtimeConfig = {
  appName: String(process.env.APP_NAME || ownerConfig.regName || 'OnimaiBot').trim() || 'OnimaiBot',
  botPrefix: String(process.env.BOT_PREFIX || global.db.data.settings.prefix || '!').trim() || '!',
  printQR: parseBoolean(process.env.WHATSAPP_PRINT_QR, true),
  bootstrapSessions: unique(splitCommaList(process.env.WA_API_BOOTSTRAP_SESSIONS).map(normalizeSessionName)),
  retryLimit: parseInteger(process.env.WA_API_RETRY_LIMIT, 10),
  dryRun: parseBoolean(process.env.ONIMAIBOT_DRY_RUN, parseBoolean(process.env.ONIMAIBASEV3_DRY_RUN, false))
}

ownerConfig = {
  ...ownerConfig,
  regName: runtimeConfig.appName,
  ownerContact: ownerConfig.ownerContact || (primaryOwnerDigits ? `https://wa.me/${primaryOwnerDigits}` : '')
}

global.db.data.settings.prefix = runtimeConfig.botPrefix

const COMMAND_ALIASES = new Map([
  ['menu', 'menu'],
  ['menü', 'menu'],
  ['help', 'help'],
  ['hilfe', 'help'],
  ['commands', 'help'],
  ['befehle', 'help'],
  ['register', 'register'],
  ['reg', 'register'],
  ['me', 'me'],
  ['profil', 'me'],
  ['profile', 'me'],
  ['ping', 'ping'],
  ['uptime', 'uptime'],
  ['alive', 'ping'],
  ['about', 'about'],
  ['info', 'about'],
  ['ownercontact', 'ownercontact'],
  ['prefix', 'prefix'],
  ['setprefix', 'setprefix'],
  ['changeprefix', 'setprefix'],
  ['plugins', 'plugins'],
  ['plugin', 'plugins'],
  ['stats', 'stats'],
  ['runtime', 'stats'],
  ['groupinfo', 'groupinfo'],
  ['gruppeninfo', 'groupinfo'],
  ['owner', 'owner'],
  ['tagall', 'tagall'],
  ['hidetag', 'tagall'],
  ['welcome', 'welcome'],
  ['setwelcome', 'welcome'],
  ['session-info', 'session-info'],
  ['sessioninfo', 'session-info'],
  ['sessions', 'sessions'],
  ['session-start', 'session-start'],
  ['sessionstart', 'session-start'],
  ['startsession', 'session-start'],
  ['session-pair', 'session-pair'],
  ['sessionpair', 'session-pair'],
  ['pairsession', 'session-pair'],
  ['session-pause', 'session-pause'],
  ['sessionpause', 'session-pause'],
  ['pausesession', 'session-pause'],
  ['session-resume', 'session-resume'],
  ['sessionresume', 'session-resume'],
  ['resumesession', 'session-resume'],
  ['session-stop', 'session-stop'],
  ['sessionstop', 'session-stop'],
  ['stopsession', 'session-stop'],
  ['session-delete', 'session-delete'],
  ['sessiondelete', 'session-delete'],
  ['deletesession', 'session-delete']
])

const BUILTIN_COMMANDS = [
  'menu',
  'help',
  'register',
  'me',
  'ping',
  'uptime',
  'about',
  'ownercontact',
  'prefix',
  'setprefix',
  'plugins',
  'stats',
  'groupinfo',
  'owner',
  'tagall',
  'welcome',
  'session-info',
  'sessions',
  'session-start',
  'session-pair',
  'session-pause',
  'session-resume',
  'session-stop',
  'session-delete'
]

const getDepVersion = (name) => packageMeta.dependencies?.[name] || 'unbekannt'

const getCommandPrefix = () => String(global.db.data.settings.prefix || runtimeConfig.botPrefix || '!').trim() || '!'

const getUserKey = (sender = '') => createHash('md5').update(String(sender || '')).digest('hex')

const getDisplayMention = (jid = '') => {
  const digits = extractDigits(jid)
  return digits ? `@${digits}` : '@user'
}

const formatDateTime = (inputDate) => {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate)
  return Number.isNaN(date.getTime())
    ? 'unbekannt'
    : date.toLocaleString('de-DE', { timeZone: TZ })
}

const formatDuration = (ms = 0) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`${days}d`)
  if (hours || parts.length) parts.push(`${hours}h`)
  if (minutes || parts.length) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}

const toEpochMs = (value) => {
  if (typeof value === 'number') return value * 1000
  if (typeof value?.low === 'number') return value.low * 1000
  return Date.now()
}

const normalizeCommand = (raw = '') => {
  const base = String(raw || '').trim().toLowerCase()
  if (!base) return ''
  const normalized = base.replace(/\s+/g, '-')
  return COMMAND_ALIASES.get(base) || COMMAND_ALIASES.get(normalized) || normalized
}

const suggestCommands = (input = '') => {
  const normalized = normalizeCommand(input)
  if (!normalized) return BUILTIN_COMMANDS.slice(0, 4)
  const compact = normalized.replace(/-/g, '')
  return BUILTIN_COMMANDS
    .filter((command) => {
      const current = command.replace(/-/g, '')
      return current.startsWith(compact) || current.includes(compact) || compact.includes(current.slice(0, 3))
    })
    .slice(0, 4)
}

const ensureUser = (sender = '', pushName = '') => {
  const userKey = getUserKey(sender)
  const base = global.db.data.users[userKey] || {}
  global.db.data.users[userKey] = {
    jid: sender,
    pushName: pushName || base.pushName || null,
    registered: base.registered || false,
    name: base.name || null,
    age: base.age || null,
    level: Number.isFinite(base.level) ? base.level : 1,
    xp: Number.isFinite(base.xp) ? base.xp : 0,
    createdAt: base.createdAt || Date.now(),
    lastSeenAt: Date.now(),
    registeredAt: base.registeredAt || null,
    commandCount: Number.isFinite(base.commandCount) ? base.commandCount : 0,
    ...base,
    pushName: pushName || base.pushName || null,
    lastSeenAt: Date.now()
  }
  return global.db.data.users[userKey]
}

const ensureGroupSettings = (chatId = '') => {
  const base = global.db.data.groups[chatId] || {}
  global.db.data.groups[chatId] = {
    welcomeEnabled: base.welcomeEnabled || false,
    welcomeTemplate: base.welcomeTemplate || DEFAULT_WELCOME_TEMPLATE,
    goodbyeTemplate: base.goodbyeTemplate || DEFAULT_GOODBYE_TEMPLATE,
    createdAt: base.createdAt || Date.now(),
    updatedAt: Date.now(),
    ...base,
    updatedAt: Date.now()
  }
  return global.db.data.groups[chatId]
}

const rememberSession = (sessionName = '', patch = {}) => {
  const normalized = normalizeSessionName(sessionName)
  if (!normalized) return null
  const base = global.db.data.sessions[normalized] || {}
  global.db.data.sessions[normalized] = {
    id: normalized,
    state: base.state || 'unknown',
    desiredState: base.desiredState || 'stopped',
    createdAt: base.createdAt || Date.now(),
    updatedAt: Date.now(),
    lastStartedAt: base.lastStartedAt || null,
    lastMethod: base.lastMethod || null,
    phoneNumber: base.phoneNumber || null,
    lastError: base.lastError || null,
    ...base,
    ...patch,
    updatedAt: Date.now()
  }
  return global.db.data.sessions[normalized]
}

const getSessionStatus = (session = null) => {
  if (!session) return 'offline'
  const stateCandidates = [
    session.status,
    session.state,
    session.connection,
    session.connectionState,
    session.sessionState,
    session.ws?.readyState === 1 ? 'online' : null,
    session.user ? 'online' : null,
    session.sock?.user ? 'online' : null,
    session.isPaused ? 'paused' : null,
    session.isStopped ? 'stopped' : null
  ]
    .map((entry) => String(entry ?? '').trim().toLowerCase())
    .filter(Boolean)

  if (stateCandidates.some((value) => ['online', 'open', 'connected', 'running', 'ready'].includes(value))) return 'online'
  if (stateCandidates.some((value) => ['paused', 'pause'].includes(value))) return 'paused'
  if (stateCandidates.some((value) => ['stopped', 'stop', 'closed', 'close', 'offline'].includes(value))) return 'offline'
  if (stateCandidates.some((value) => ['connecting', 'starting', 'booting', 'loading', 'standby'].includes(value))) return 'starting'
  return 'unknown'
}

const formatSessionStatusBadge = (status = 'unknown') => {
  switch (status) {
    case 'online':
      return '🟢 online'
    case 'starting':
      return '🟡 startet'
    case 'paused':
      return '🟠 pausiert'
    case 'offline':
      return '🔴 offline'
    default:
      return '⚪ unbekannt'
  }
}

const getSessionOwnJid = (session = null) => normalizeJid(
  session?.user?.id
  || session?.user?.jid
  || session?.sock?.user?.id
  || session?.sock?.user?.jid
  || session?.authState?.creds?.me?.id
  || ''
)

const getKnownSessionNames = (currentSessionId = '') => {
  const names = new Set([...runtimeConfig.bootstrapSessions, ...Object.keys(global.db.data.sessions || {})])
  const normalizedCurrent = normalizeSessionName(currentSessionId)
  if (normalizedCurrent) names.add(normalizedCurrent)

  if (onimai && typeof onimai === 'object') {
    const candidates = [onimai.sessions, onimai.sessionRegistry, onimai.sessionStore]
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'object') {
        Object.keys(candidate).forEach((key) => names.add(normalizeSessionName(key)))
      }
    }
  }

  return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b, 'de'))
}

const isOwner = (sender = '') => {
  const senderDigits = extractDigits(sender)
  if (!senderDigits) return false
  return ownerNumbers.some((entry) => extractDigits(entry) === senderDigits)
}

const canManageSessions = (sender = '') => ownerNumbers.length === 0 || isOwner(sender)

const buildSessionManagementDeniedText = () => {
  const contactLine = ownerConfig.ownerContact ? `\n📞 Kontakt: ${ownerConfig.ownerContact}` : ''
  return `❌ *Session-Steuerung ist nur für den Owner freigeschaltet.*${contactLine}`
}

const grantXp = (user, amount = 0) => {
  const previousLevel = Number.isFinite(user.level) ? user.level : 1
  user.xp = Number.isFinite(user.xp) ? user.xp + amount : amount
  user.level = Math.max(previousLevel, Math.floor(user.xp / 100) + 1)
  return {
    leveledUp: user.level > previousLevel,
    previousLevel,
    level: user.level
  }
}

const resolveProfilePicture = async (session, jid) => {
  try {
    if (typeof session?.profilePictureUrl === 'function') {
      return await session.profilePictureUrl(jid, 'image').catch(() => null)
    }
    if (typeof session?.getProfilePictureUrl === 'function') {
      return await session.getProfilePictureUrl(jid).catch(() => null)
    }
  } catch {
    return null
  }
  return null
}

const resolveGroupMetadata = async (session, chatId) => {
  if (!chatId.endsWith('@g.us')) return null
  if (typeof session?.groupMetadata === 'function') {
    return await session.groupMetadata(chatId).catch(() => null)
  }
  if (typeof session?.getGroupMetadata === 'function') {
    return await session.getGroupMetadata(chatId).catch(() => null)
  }
  return null
}

const sendTextMessage = async (session, chatId, text, { quoted = null, mentions = [] } = {}) => {
  const payload = {
    text,
    ...(mentions.length ? { mentions } : {})
  }
  return session.sendMessage(chatId, payload, quoted ? { quoted } : undefined)
}

const sendMenuMessage = async (session, chatId, text, quoted = null) => {
  const payload = {
    text,
    footer: `${runtimeConfig.appName} • WhatsApp only`,
    buttons: [
      { buttonId: 'cmd:help', buttonText: { displayText: 'ℹ️ Hilfe' }, type: 1 },
      { buttonId: 'cmd:me', buttonText: { displayText: '👤 Profil' }, type: 1 },
      { buttonId: 'cmd:ping', buttonText: { displayText: '🏓 Ping' }, type: 1 },
      { buttonId: 'cmd:sessions', buttonText: { displayText: '📡 Sessions' }, type: 1 }
    ],
    headerType: 1
  }

  try {
    return await session.sendMessage(chatId, payload, quoted ? { quoted } : undefined)
  } catch {
    return sendTextMessage(session, chatId, text, { quoted })
  }
}

const buildMenuText = (sender = '') => {
  const prefix = getCommandPrefix()
  const sessionOpenMode = ownerNumbers.length === 0

  return [
    `🌸 *${runtimeConfig.appName} Menü*`,
    '',
    '📱 *Allgemein*',
    `• \`${prefix}menu\` - Dieses Menü`,
    `• \`${prefix}help\` - Vollständige Hilfe`,
    `• \`${prefix}ping\` - Schneller Statuscheck`,
    `• \`${prefix}uptime\` - Laufzeit & Bootstatus`,
    `• \`${prefix}about\` - Stack & Projektinfo`,
    `• \`${prefix}ownercontact\` - Owner-Kontakt`,
    `• \`${prefix}prefix\` - Aktuellen Prefix zeigen`,
    `• \`${prefix}plugins\` - Zeigt eingebaute WhatsApp-Features`,
    `• \`${prefix}stats\` - Runtime-Statistiken`,
    `• \`${prefix}register <Name>\` - Registrieren`,
    `• \`${prefix}me\` - Dein Profil`,
    '',
    '👥 *Gruppen*',
    `• \`${prefix}tagall\` - Alle markieren`,
    `• \`${prefix}groupinfo\` - Gruppeninfos anzeigen`,
    `• \`${prefix}welcome on/off/status/preview\` - Welcome steuern`,
    '',
    '📡 *Sessions*',
    `• \`${prefix}sessions\` - Bekannte Sessions`,
    `• \`${prefix}session-info\` - Infos zur aktuellen Session`,
    sessionOpenMode || isOwner(sender)
      ? `• \`${prefix}session-start\`, \`${prefix}session-pair\`, \`${prefix}session-pause\`, \`${prefix}session-resume\`, \`${prefix}session-stop\`, \`${prefix}session-delete\``
      : '• Owner-only: Session-Start / Pairing / Pause / Resume / Stop / Delete',
    '',
    '💜 *Owner*',
    `• ${isOwner(sender) ? `\`${prefix}owner\` - Owner-Hilfe` : '[nur für Owner]'}`,
    sessionOpenMode || isOwner(sender)
      ? `• \`${prefix}setprefix <neu>\` - Prefix ändern`
      : '• Owner-only: Prefix ändern',
    '',
    `👑 Owner: *${ownerConfig.ownerName}* ${ownerConfig.ownerTag}`,
    `📞 Kontakt: ${ownerConfig.ownerContact || 'nicht gesetzt'}`,
    '',
    '✨ Kein Discord-Kram, keine Fremdbrücken – hier ist alles konsequent auf WhatsApp gebaut.'
  ].join('\n')
}

const buildHelpText = () => {
  const prefix = getCommandPrefix()
  return [
    `🆘 *${runtimeConfig.appName} Hilfe*`,
    '',
    '*Wichtige Commands*',
    `• \`${prefix}ping\` → prüft ob die Base lebt`,
    `• \`${prefix}uptime\` → zeigt Uptime, Bootzeit und Counters`,
    `• \`${prefix}about\` → zeigt Stack & Branding`,
    `• \`${prefix}ownercontact\` → zeigt den Owner-Kontakt`,
    `• \`${prefix}prefix\` → zeigt den aktiven Prefix`,
    `• \`${prefix}plugins\` → zeigt eingebaute WhatsApp-Features`,
    `• \`${prefix}stats\` → zeigt Laufzeit, Nutzer und Command-Zahlen`,
    `• \`${prefix}register <Name>\` / \`${prefix}me\` → kleines Profilsystem`,
    `• \`${prefix}tagall\` → markiert Gruppenmitglieder`,
    `• \`${prefix}groupinfo\` → zeigt Gruppenname, Admins und Beschreibung`,
    `• \`${prefix}welcome on|off|status|preview\` → Welcome-System`,
    `• \`${prefix}welcome set <Text>\` → eigener Welcome-Text`,
    `• \`${prefix}welcome setbye <Text>\` → eigener Bye-Text`,
    `• \`${prefix}setprefix <neu>\` → ändert den Prefix (Owner-only)`,
    `• \`${prefix}sessions\` / \`${prefix}session-info\` → Multi-Session-Überblick`,
    '',
    '*Welcome-Platzhalter*',
    '• `@user` → neuer / gehender Nutzer',
    '• `@subject` → Gruppenname',
    '• `@desc` → Gruppenbeschreibung',
    '• `@count` → Mitgliederzahl',
    '• `@session` → aktive Session-ID',
    '',
    '*Owner-Hinweis*',
    ownerNumbers.length === 0
      ? '• `BOT_OWNER_NUMBERS` ist leer → Session-Commands sind aktuell offen.'
      : '• Session-Steuerung ist auf Owner begrenzt, solange `BOT_OWNER_NUMBERS` gesetzt ist.',
    '',
    `💖 ${runtimeConfig.appName} ist WhatsApp-only und bewusst zentral in \`Onimai.js\` gehalten.`
  ].join('\n')
}

const buildAboutText = () => [
  `🌸 *${runtimeConfig.appName}*`,
  '',
  'Eine schlanke WhatsApp Multi-Session Base für OnimaiBase – ohne Discord-Bridge, ohne fremde Plattform-Umwege.',
  '',
  '*Stack*',
  `• @neelegirly/wa-api: ${getDepVersion('@neelegirly/wa-api')}`,
  `• @neelegirly/baileys: ${getDepVersion('@neelegirly/baileys')}`,
  `• @neelegirly/libsignal: ${getDepVersion('@neelegirly/libsignal')}`,
  `• @neelegirly/downloader: ${getDepVersion('@neelegirly/downloader')}`,
  `• lowdb: ${getDepVersion('lowdb')}`,
  '',
  '*OnimaiBase-Fokus*',
  '• zentrale Command-Logik direkt in `Onimai.js`',
  '• Welcome / Goodbye über WhatsApp-Systemmeldungen',
  '• Profile, Owner-Infos und Session-Steuerung in einem Flow',
  '• Prefix- und Gruppeninfo-Commands direkt eingebaut',
  '• textbasierte Menüs mit Button-Fallback',
  '',
  `👑 Owner: ${ownerConfig.ownerName} ${ownerConfig.ownerTag}`
].join('\n')

const buildPluginsText = () => [
  `🧩 *${runtimeConfig.appName} Features*`,
  '',
  'Diese OnimaiBase-Version ist bewusst *kein* Discord-Bot und auch keine Misch-Bridge.',
  '',
  '*Eingebaut*',
  '• WhatsApp Message Parser für Text, Bilder, Videos, Dokumente, Buttons und Listen',
  '• Profilsystem mit Register / Me / XP / Level',
  '• Prefix-, Uptime- und Gruppeninfo-Commands für den Alltag',
  '• Welcome / Goodbye via WhatsApp-Stub-Events',
  '• Multi-Session-Steuerung per Chat-Commands',
  '• Owner-Hilfe und Runtime-Statistiken',
  '• Menü mit Button-Fallback für ältere Clients',
  '',
  '*Absichtlich nicht drin*',
  '• keine Discord-Logik',
  '• keine Telegram-Brücke',
  '• keine ausgelagerte Command-Orgie',
  '',
  '💡 Alles Wichtige lebt direkt in `Onimai.js`, damit man schnell versteht, wo was passiert.'
].join('\n')

const buildStatsText = () => {
  const commandUsage = Object.entries(global.db.data.stats.commandUsage || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([command, count]) => `• ${command}: ${count}`)

  return [
    `📊 *${runtimeConfig.appName} Stats*`,
    '',
    `⏱️ Uptime: *${formatDuration(Date.now() - BOOT_AT)}*`,
    `💬 Nachrichten seit Boot: *${global.db.data.stats.totalMessages}*`,
    `⌨️ Commands seit Boot: *${global.db.data.stats.totalCommands}*`,
    `👤 Gespeicherte User: *${Object.keys(global.db.data.users || {}).length}*`,
    `👥 Gruppen-Einstellungen: *${Object.keys(global.db.data.groups || {}).length}*`,
    `📡 Bekannte Sessions: *${getKnownSessionNames().length}*`,
    `🤝 Welcome-Events: *${global.db.data.stats.totalWelcomes}*`,
    `👋 Goodbye-Events: *${global.db.data.stats.totalGoodbyes}*`,
    '',
    '*Top Commands*',
    ...(commandUsage.length ? commandUsage : ['• noch keine Commands gezählt'])
  ].join('\n')
}

const buildOwnerText = () => {
  const prefix = getCommandPrefix()
  return [
    `👑 *${runtimeConfig.appName} Owner-Hilfe*`,
    '',
    `• \`${prefix}sessions\` → alle bekannten Sessions listen`,
    `• \`${prefix}session-start <id>\` → Session per QR starten`,
    `• \`${prefix}session-pair <id> <telefonnummer>\` → Pairing-Code starten`,
    `• \`${prefix}session-pause <id>\` → Session pausieren`,
    `• \`${prefix}session-resume <id>\` → Session fortsetzen`,
    `• \`${prefix}session-stop <id>\` → Session stoppen`,
    `• \`${prefix}session-delete <id>\` → Session-Registry entfernen`,
    '',
    `📞 Owner-Kontakt: ${ownerConfig.ownerContact || 'nicht gesetzt'}`,
    ownerNumbers.length === 0
      ? '⚠️ Hinweis: `BOT_OWNER_NUMBERS` ist leer – Session-Commands sind offen.'
      : `🔐 Freigegebene Owner-Nummern: ${ownerNumbers.map((jid) => `+${extractDigits(jid)}`).join(', ')}`
  ].join('\n')
}

const buildSessionInfoText = (sessionId = '', session = null, sender = '', chatId = '') => {
  const ownJid = getSessionOwnJid(session)
  return [
    '📡 *Session-Info*',
    '',
    `• ID: *${sessionId || 'unbekannt'}*`,
    `• Status: *${formatSessionStatusBadge(getSessionStatus(session))}*`,
    `• Bot-JID: *${ownJid || 'noch unbekannt'}*`,
    `• Chat: *${chatId || 'unbekannt'}*`,
    `• Du bist Owner: *${isOwner(sender) ? 'ja' : 'nein'}*`,
    `• Session-Steuerung freigeschaltet: *${canManageSessions(sender) ? 'ja' : 'nein'}*`,
    '',
    `💡 Bekannte Sessions insgesamt: *${getKnownSessionNames(sessionId).length}*`
  ].join('\n')
}

const buildSessionsText = (currentSessionId = '') => {
  const names = getKnownSessionNames(currentSessionId)
  if (!names.length) {
    return '📡 *Keine Session bekannt.*\n\nSetze `WA_API_BOOTSTRAP_SESSIONS` in der `.env` oder starte per `!session-start <id>`.'
  }

  const lines = ['📡 *Bekannte Sessions*', '']
  for (const name of names) {
    const liveSession = typeof onimai?.getSession === 'function' ? onimai.getSession(name) : null
    const knownEntry = global.db.data.sessions?.[name] || null
    const status = liveSession ? getSessionStatus(liveSession) : (knownEntry?.state || 'offline')
    lines.push(`• *${name}* → ${formatSessionStatusBadge(status)}`)
  }

  return lines.join('\n')
}

const buildUnknownCommandText = (command = '') => {
  const prefix = getCommandPrefix()
  const suggestions = suggestCommands(command).map((entry) => `\`${prefix}${entry}\``)
  return [
    `❌ Unbekannter Befehl: \`${prefix}${command}\``,
    '',
    suggestions.length
      ? `💡 Vielleicht meintest du: ${suggestions.join(', ')}`
      : `💡 Tipp: Nutze \`${prefix}menu\` oder \`${prefix}help\`.`
  ].join('\n')
}

const formatWelcomeTemplate = ({ template = '', participant = '', subject = '', description = '', memberCount = 0, sessionId = '' }) => {
  return String(template || '')
    .replace(/@user/g, getDisplayMention(participant))
    .replace(/@subject/g, subject || 'Unbekannte Gruppe')
    .replace(/@desc/g, description || 'Keine Beschreibung gesetzt.')
    .replace(/@count/g, String(memberCount || 0))
    .replace(/@session/g, sessionId || 'unbekannt')
    .replace(/@owner/g, ownerConfig.ownerName || 'Owner')
}

const buildWelcomeStatusText = (groupConfig, subject = '') => {
  const prefix = getCommandPrefix()
  return [
    `👋 *Welcome-Status${subject ? ` für ${subject}` : ''}*`,
    '',
    `• Aktiv: *${groupConfig.welcomeEnabled ? 'ja' : 'nein'}*`,
    `• Join-Template: ${groupConfig.welcomeTemplate}`,
    `• Bye-Template: ${groupConfig.goodbyeTemplate}`,
    '',
    '*Verwendung*',
    `• \`${prefix}welcome on\``,
    `• \`${prefix}welcome off\``,
    `• \`${prefix}welcome preview\``,
    `• \`${prefix}welcome set <Text>\``,
    `• \`${prefix}welcome setbye <Text>\``,
    `• \`${prefix}welcome reset\``
  ].join('\n')
}

const normalizeInteractiveCommand = (text = '', messageType = '') => {
  const prefix = getCommandPrefix()
  const normalized = String(text || '').trim()
  if (!normalized) return ''
  if (normalized.startsWith(prefix)) return normalized
  if (normalized.startsWith('cmd:')) return `${prefix}${normalized.slice(4)}`
  if (['Button', 'List', 'Interactive'].includes(messageType)) return `${prefix}${normalized}`
  return normalized
}

const parseInteractiveParams = (params) => {
  const json = safeJsonParse(params, {}) || {}
  return String(json.id || json.command || json.rowId || json.selectedId || '').trim()
}

const parseIncomingMessage = (msg = {}) => {
  const { message } = msg
  const stubType = Number(msg?.messageStubType || 0)
  const stubName = WAMessageStubType?.[stubType] || ''

  if (message?.extendedTextMessage) {
    return { type: 'ExtendedText', text: message.extendedTextMessage.text || '', stubType, stubName }
  }
  if (message?.conversation) {
    return { type: 'Text', text: message.conversation || '', stubType, stubName }
  }
  if (message?.imageMessage) {
    return { type: 'Image', text: message.imageMessage.caption || '', stubType, stubName }
  }
  if (message?.videoMessage) {
    return { type: 'Video', text: message.videoMessage.caption || '', stubType, stubName }
  }
  if (message?.documentMessage) {
    return { type: 'Document', text: message.documentMessage.caption || '', stubType, stubName }
  }
  if (message?.buttonsResponseMessage) {
    return {
      type: 'Button',
      text: message.buttonsResponseMessage.selectedButtonId || message.buttonsResponseMessage.selectedDisplayText || '',
      stubType,
      stubName
    }
  }
  if (message?.templateButtonReplyMessage) {
    return {
      type: 'Button',
      text: message.templateButtonReplyMessage.selectedId || message.templateButtonReplyMessage.selectedDisplayText || '',
      stubType,
      stubName
    }
  }
  if (message?.listResponseMessage) {
    return {
      type: 'List',
      text: message.listResponseMessage.singleSelectReply?.selectedRowId || message.listResponseMessage.title || '',
      stubType,
      stubName
    }
  }
  if (message?.interactiveResponseMessage) {
    const params = message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}'
    return {
      type: 'Interactive',
      text: parseInteractiveParams(params),
      stubType,
      stubName
    }
  }
  if (message?.reactionMessage) {
    return {
      type: 'Reaction',
      text: message.reactionMessage.text || '',
      stubType,
      stubName
    }
  }
  if (message?.audioMessage) {
    return { type: 'Audio', text: '', stubType, stubName }
  }
  if (message?.stickerMessage) {
    return { type: 'Sticker', text: '', stubType, stubName }
  }
  return {
    type: stubName ? 'SystemStub' : 'Unknown',
    text: '',
    stubType,
    stubName
  }
}

const resolveParticipantEvent = (msg = {}, sender = '') => {
  const stubType = Number(msg?.messageStubType || 0)
  if (!stubType) return null

  const stubName = String(WAMessageStubType?.[stubType] || '').trim().toUpperCase()
  if (!stubName) return null

  const parameterMentions = normalizeMentionList(msg?.messageStubParameters || [])
  const participants = parameterMentions.length ? parameterMentions : normalizeMentionList([sender])

  if (/(GROUP_PARTICIPANT_ADD|GROUP_PARTICIPANT_INVITE|GROUP_PARTICIPANT_LINKED_GROUP_JOIN|GROUP_PARTICIPANT_JOIN_REQUEST_APPROVED)/.test(stubName)) {
    return { action: 'welcome', participants, stubName }
  }
  if (/(GROUP_PARTICIPANT_REMOVE|GROUP_PARTICIPANT_LEAVE)/.test(stubName)) {
    return { action: 'goodbye', participants, stubName }
  }
  return null
}

const maybeHandleWelcomeEvent = async ({ msg, session, chatId, sender }) => {
  if (!chatId.endsWith('@g.us')) return false

  const event = resolveParticipantEvent(msg, sender)
  if (!event || !event.participants.length) return false

  const groupConfig = ensureGroupSettings(chatId)
  if (!groupConfig.welcomeEnabled) return false

  const metadata = await resolveGroupMetadata(session, chatId)
  const subject = metadata?.subject || 'Unbekannte Gruppe'
  const description = String(metadata?.desc || '').trim() || 'Keine Beschreibung gesetzt.'
  const memberCount = Array.isArray(metadata?.participants) ? metadata.participants.length : 0
  const template = event.action === 'welcome' ? groupConfig.welcomeTemplate : groupConfig.goodbyeTemplate

  for (const participant of event.participants) {
    const text = formatWelcomeTemplate({
      template,
      participant,
      subject,
      description,
      memberCount,
      sessionId: msg.sessionId || DEFAULT_SESSION_NAME
    })
    await sendTextMessage(session, chatId, text, { mentions: [participant] }).catch((error) => {
      console.error('❌ Welcome/Goodbye konnte nicht gesendet werden:', error)
    })
  }

  if (event.action === 'welcome') {
    global.db.data.stats.totalWelcomes += event.participants.length
  } else {
    global.db.data.stats.totalGoodbyes += event.participants.length
  }
  await saveDatabase()
  return true
}

const logIncomingMessage = ({ chatId, msg, pushName, parsed }) => {
  const isGroup = chatId.endsWith('@g.us')
  const lines = [
    `${isGroup ? '👥 Gruppe' : '💬 Privat'} • ${parsed.type}`,
    `Session: ${msg.sessionId || 'unbekannt'}`,
    `Von: ${pushName || 'Unbekannt'}`,
    `Zeit: ${formatDateTime(toEpochMs(msg?.messageTimestamp))}`,
    parsed.stubName ? `Stub: ${parsed.stubName}` : null,
    `Inhalt: ${parsed.text || '[kein Text]'}`
  ].filter(Boolean)

  console.log(boxen(lines.join('\n'), {
    padding: 1,
    borderStyle: 'round',
    borderColor: isGroup ? 'magenta' : 'cyan'
  }))
}

const updateCommandStats = (command = '') => {
  global.db.data.stats.totalCommands += 1
  global.db.data.stats.commandUsage[command] = (global.db.data.stats.commandUsage[command] || 0) + 1
}

const buildStartOptions = () => ({
  printQR: runtimeConfig.printQR,
  retryLimit: runtimeConfig.retryLimit
})

const startSessionByQr = async (sessionName = '') => {
  const target = normalizeSessionName(sessionName) || DEFAULT_SESSION_NAME
  rememberSession(target, {
    state: 'starting',
    desiredState: 'running',
    lastStartedAt: Date.now(),
    lastMethod: 'qr',
    lastError: null
  })
  await saveDatabase()
  const startedSession = await onimai.startSession(target, buildStartOptions())
  rememberSession(target, {
    state: getSessionStatus(typeof onimai?.getSession === 'function' ? onimai.getSession(target) : startedSession),
    desiredState: 'running',
    lastStartedAt: Date.now(),
    lastMethod: 'qr',
    lastError: null
  })
  await saveDatabase()
  return target
}

const startSessionByPairing = async (sessionName = '', phoneNumber = '') => {
  const normalizedPhone = extractDigits(phoneNumber)
  if (!/^\d{10,15}$/.test(normalizedPhone)) {
    throw new Error('Bitte eine Telefonnummer mit 10 bis 15 Ziffern angeben.')
  }
  const target = normalizeSessionName(sessionName) || DEFAULT_SESSION_NAME
  rememberSession(target, {
    state: 'starting',
    desiredState: 'running',
    lastStartedAt: Date.now(),
    lastMethod: 'pairing',
    phoneNumber: normalizedPhone,
    lastError: null
  })
  await saveDatabase()
  const startedSession = await onimai.startSessionWithPairingCode(target, {
    ...buildStartOptions(),
    phoneNumber: normalizedPhone
  })
  rememberSession(target, {
    state: getSessionStatus(typeof onimai?.getSession === 'function' ? onimai.getSession(target) : startedSession),
    desiredState: 'running',
    lastStartedAt: Date.now(),
    lastMethod: 'pairing',
    phoneNumber: normalizedPhone,
    lastError: null
  })
  await saveDatabase()
  return target
}

const pauseKnownSession = async (sessionName = '') => {
  const target = normalizeSessionName(sessionName)
  if (!target) throw new Error('Bitte eine Session-ID angeben.')
  if (typeof onimai.pauseSession !== 'function') throw new Error('pauseSession wird von deiner wa-api aktuell nicht unterstützt.')
  await onimai.pauseSession(target)
  rememberSession(target, { state: 'paused', desiredState: 'paused', lastError: null })
  await saveDatabase()
  return target
}

const resumeKnownSession = async (sessionName = '') => {
  const target = normalizeSessionName(sessionName)
  if (!target) throw new Error('Bitte eine Session-ID angeben.')
  if (typeof onimai.resumeSession !== 'function') throw new Error('resumeSession wird von deiner wa-api aktuell nicht unterstützt.')
  await onimai.resumeSession(target, buildStartOptions())
  rememberSession(target, { state: 'online', desiredState: 'running', lastError: null })
  await saveDatabase()
  return target
}

const stopKnownSession = async (sessionName = '') => {
  const target = normalizeSessionName(sessionName)
  if (!target) throw new Error('Bitte eine Session-ID angeben.')
  if (typeof onimai.stopSession !== 'function') throw new Error('stopSession wird von deiner wa-api aktuell nicht unterstützt.')
  await onimai.stopSession(target)
  rememberSession(target, { state: 'offline', desiredState: 'stopped', lastError: null })
  await saveDatabase()
  return target
}

const deleteKnownSession = async (sessionName = '') => {
  const target = normalizeSessionName(sessionName)
  if (!target) throw new Error('Bitte eine Session-ID angeben.')
  if (typeof onimai.deleteSession !== 'function') throw new Error('deleteSession wird von deiner wa-api aktuell nicht unterstützt.')
  await onimai.deleteSession(target)
  delete global.db.data.sessions[target]
  await saveDatabase()
  return target
}

const bootstrapConfiguredSessions = async () => {
  const configured = unique([
    ...runtimeConfig.bootstrapSessions,
    ...Object.entries(global.db.data.sessions || {})
      .filter(([, entry]) => entry?.desiredState === 'running')
      .map(([sessionName]) => sessionName)
  ])

  if (!configured.length) {
    const fallback = DEFAULT_SESSION_NAME
    await startSessionByQr(fallback)
    console.log(chalk.green(`✅ Fallback-Session gestartet: ${fallback}`))
    return
  }

  for (const sessionName of configured) {
    try {
      await startSessionByQr(sessionName)
      console.log(chalk.green(`✅ Bootstrap-Session gestartet: ${sessionName}`))
    } catch (error) {
      rememberSession(sessionName, { state: 'offline', lastError: error.message, desiredState: 'running' })
      await saveDatabase()
      console.error(chalk.red(`❌ Bootstrap für ${sessionName} fehlgeschlagen:`), error)
    }
  }
}

const printStartupBox = () => {
  const ownerLine = primaryOwnerDigits ? `+${primaryOwnerDigits}` : 'nicht gesetzt'
  const bootstrapLine = runtimeConfig.bootstrapSessions.length ? runtimeConfig.bootstrapSessions.join(', ') : 'keine'

  console.log(boxen([
    chalk.bold.magenta(`${runtimeConfig.appName} • OnimaiBase`),
    '',
    `Prefix: ${chalk.cyan(getCommandPrefix())}`,
    `QR im Terminal: ${runtimeConfig.printQR ? 'ja' : 'nein'}`,
    `Dry-Run: ${runtimeConfig.dryRun ? 'ja' : 'nein'}`,
    `Owner: ${ownerLine}`,
    `Bootstrap-Sessions: ${bootstrapLine}`,
    '',
    '💜 WhatsApp-only, kein Discord, keine Nebenbaustellen.'
  ].join('\n'), {
    padding: 1,
    borderStyle: 'double',
    borderColor: 'magenta'
  }))
}

const askQuestion = async (rl, question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(String(answer || '').trim()))
})

const startRuntime = async () => {
  printStartupBox()

  if (runtimeConfig.dryRun) {
    console.log(chalk.yellow('🧪 Dry-Run aktiv – es wird keine echte WhatsApp-Session gestartet.'))
    return
  }

  const isInteractive = !!(input.isTTY && output.isTTY)
  if (!isInteractive) {
    await bootstrapConfiguredSessions()
    return
  }

  const rl = readline.createInterface({ input, output })
  try {
    console.log(chalk.gray('1) QR-Start • 2) Pairing-Code • 3) Bootstrap-Sessions'))
    const choice = await askQuestion(rl, chalk.magenta('🌸 Auswahl (1/2/3): '))

    if (choice === '1') {
      const fallback = runtimeConfig.bootstrapSessions[0] || DEFAULT_SESSION_NAME
      const enteredSessionName = await askQuestion(rl, chalk.magenta(`📡 Session-ID [${fallback}]: `))
      const sessionName = normalizeSessionName(enteredSessionName || fallback) || fallback
      await startSessionByQr(sessionName)
      console.log(chalk.green(`✅ QR-Flow gestartet für Session ${sessionName}`))
      return
    }

    if (choice === '2') {
      const fallback = runtimeConfig.bootstrapSessions[0] || DEFAULT_SESSION_NAME
      const enteredSessionName = await askQuestion(rl, chalk.magenta(`📡 Session-ID [${fallback}]: `))
      const sessionName = normalizeSessionName(enteredSessionName || fallback) || fallback
      const phoneNumber = await askQuestion(rl, chalk.magenta('📱 Telefonnummer (491234567890): '))
      await startSessionByPairing(sessionName, phoneNumber)
      console.log(chalk.green(`✅ Pairing-Flow gestartet für Session ${sessionName}`))
      return
    }

    await bootstrapConfiguredSessions()
  } finally {
    rl.close()
  }
}

onimai.onMessageReceived(async (msg) => {
  try {
    const { key, pushName } = msg
    const chatId = key?.remoteJid
    if (!chatId) return

    const session = typeof onimai?.getSession === 'function' ? onimai.getSession(msg.sessionId) : null
    if (!session) return

    const parsed = parseIncomingMessage(msg)
    logIncomingMessage({ chatId, msg, pushName, parsed })

    global.db.data.stats.totalMessages += 1

    const sender = normalizeJid(key?.participant || key?.remoteJid || msg?.participant || '')
    if (!sender) {
      console.error('❌ Kein gültiger Sender in der Nachricht gefunden.')
      return
    }

    const user = ensureUser(sender, pushName)

    await maybeHandleWelcomeEvent({
      msg,
      session,
      chatId,
      sender
    })

    const normalizedText = normalizeInteractiveCommand(parsed.text, parsed.type)
    if (!normalizedText.startsWith(getCommandPrefix())) {
      return
    }

    const withoutPrefix = normalizedText.slice(getCommandPrefix().length).trim()
    if (!withoutPrefix) return

    const [rawCommand, ...rest] = withoutPrefix.split(/\s+/)
    const command = normalizeCommand(rawCommand)
    const args = rest
    const sessionId = normalizeSessionName(msg.sessionId || '') || DEFAULT_SESSION_NAME

    let commandHandled = false

    switch (command) {
      case 'menu': {
        commandHandled = true
        await sendMenuMessage(session, chatId, buildMenuText(sender), msg)
        break
      }

      case 'help': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildHelpText(), { quoted: msg })
        break
      }

      case 'ping': {
        commandHandled = true
        const latency = Date.now() - toEpochMs(msg.messageTimestamp)
        await sendTextMessage(session, chatId, [
          '🏓 *Pong!*',
          '',
          `• Latenz: *${Math.max(0, latency)} ms*`,
          `• Session: *${sessionId}*`,
          `• Status: *${formatSessionStatusBadge(getSessionStatus(session))}*`,
          `• Uptime: *${formatDuration(Date.now() - BOOT_AT)}*`
        ].join('\n'), { quoted: msg })
        break
      }

      case 'uptime': {
        commandHandled = true
        await sendTextMessage(session, chatId, [
          '⏱️ *Runtime-Uptime*',
          '',
          `• Uptime: *${formatDuration(Date.now() - BOOT_AT)}*`,
          `• Gebootet: *${formatDateTime(BOOT_AT)}*`,
          `• Session: *${sessionId}*`,
          `• Nachrichten: *${global.db.data.stats.totalMessages}*`,
          `• Commands: *${global.db.data.stats.totalCommands}*`
        ].join('\n'), { quoted: msg })
        break
      }

      case 'about': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildAboutText(), { quoted: msg })
        break
      }

      case 'ownercontact': {
        commandHandled = true
        await sendTextMessage(session, chatId, [
          '📞 *Owner-Kontakt*',
          '',
          `• Name: *${ownerConfig.ownerName}* ${ownerConfig.ownerTag}`,
          `• Kontakt: *${ownerConfig.ownerContact || 'nicht gesetzt'}*`,
          ownerNumbers.length
            ? `• Nummern: *${ownerNumbers.map((jid) => `+${extractDigits(jid)}`).join(', ')}*`
            : '• Nummern: *keine Owner-Nummern gesetzt*'
        ].join('\n'), { quoted: msg })
        break
      }

      case 'prefix': {
        commandHandled = true
        await sendTextMessage(session, chatId, [
          '🔤 *Prefix-Info*',
          '',
          `• Aktueller Prefix: *${getCommandPrefix()}*`,
          `• Ändern: *${canManageSessions(sender) ? 'erlaubt' : 'nur für Owner'}*`,
          `• Beispiel: \`${getCommandPrefix()}setprefix #\``
        ].join('\n'), { quoted: msg })
        break
      }

      case 'setprefix': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const nextPrefix = String(args[0] || '').trim()
        if (!nextPrefix || /\s/.test(nextPrefix) || nextPrefix.length > 5) {
          await sendTextMessage(session, chatId, '❌ Bitte gib einen Prefix ohne Leerzeichen mit maximal 5 Zeichen an.\n\nBeispiel: `!setprefix #`', { quoted: msg })
          break
        }

        global.db.data.settings.prefix = nextPrefix
        runtimeConfig.botPrefix = nextPrefix
        await saveDatabase()
        await sendTextMessage(session, chatId, `✅ Prefix geändert auf *${nextPrefix}*\n\nTeste direkt mit \`${nextPrefix}menu\`.`, { quoted: msg })
        break
      }

      case 'plugins': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildPluginsText(), { quoted: msg })
        break
      }

      case 'stats': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildStatsText(), { quoted: msg })
        break
      }

      case 'register': {
        commandHandled = true
        const displayName = args.join(' ').trim() || pushName || user.name || 'Unbekannt'
        user.registered = true
        user.name = displayName
        user.registeredAt = Date.now()
        user.pushName = pushName || user.pushName || null
        await saveDatabase()
        await sendTextMessage(session, chatId, [
          '✅ *Registrierung erfolgreich!*',
          '',
          `🌸 Name: *${user.name}*`,
          `🧬 Profil-Level: *${user.level}*`,
          `💎 XP: *${user.xp}*`,
          `🕒 Registriert: *${formatDateTime(user.registeredAt)}*`,
          '',
          `💜 Willkommen im ${runtimeConfig.appName}-Universum!`
        ].join('\n'), { quoted: msg })
        break
      }

      case 'me': {
        commandHandled = true
        const profilePic = await resolveProfilePicture(session, sender)
        const profileText = [
          `👤 *${runtimeConfig.appName} Profil*`,
          '',
          `• Name: *${user.name || pushName || 'Unbekannt'}*`,
          `• Status: *${user.registered ? 'registriert' : 'nicht registriert'}*`,
          `• Level: *${user.level}*`,
          `• XP: *${user.xp}*`,
          `• Commands: *${user.commandCount || 0}*`,
          `• Erstellt: *${formatDateTime(user.createdAt)}*`,
          `• Zuletzt gesehen: *${formatDateTime(user.lastSeenAt)}*`,
          '',
          `👑 Owner: *${ownerConfig.ownerName}* ${ownerConfig.ownerTag}`
        ].join('\n')

        if (profilePic) {
          try {
            await session.sendMessage(chatId, {
              image: { url: profilePic },
              caption: profileText
            }, { quoted: msg })
            break
          } catch {
            // Fallback auf Text
          }
        }

        await sendTextMessage(session, chatId, profileText, { quoted: msg })
        break
      }

      case 'owner': {
        commandHandled = true
        if (!isOwner(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }
        await sendTextMessage(session, chatId, buildOwnerText(), { quoted: msg })
        break
      }

      case 'tagall': {
        commandHandled = true
        if (!chatId.endsWith('@g.us')) {
          await sendTextMessage(session, chatId, '❌ `tagall` funktioniert nur in Gruppen.', { quoted: msg })
          break
        }

        const metadata = await resolveGroupMetadata(session, chatId)
        const participantIds = normalizeMentionList(metadata?.participants || [])
        if (!participantIds.length) {
          await sendTextMessage(session, chatId, '❌ Gruppenmitglieder konnten nicht geladen werden.', { quoted: msg })
          break
        }

        const mentionLine = participantIds.map((jid) => getDisplayMention(jid)).join(' ')
        await session.sendMessage(chatId, {
          text: `📢 *@alle*\n\n${mentionLine}\n\n💖 ${runtimeConfig.appName} • ${ownerConfig.ownerName}`,
          mentions: participantIds
        }, { quoted: msg })
        break
      }

      case 'groupinfo': {
        commandHandled = true
        if (!chatId.endsWith('@g.us')) {
          await sendTextMessage(session, chatId, '❌ `groupinfo` funktioniert nur in Gruppen.', { quoted: msg })
          break
        }

        const metadata = await resolveGroupMetadata(session, chatId)
        if (!metadata) {
          await sendTextMessage(session, chatId, '❌ Gruppeninfos konnten nicht geladen werden.', { quoted: msg })
          break
        }

        const participants = Array.isArray(metadata.participants) ? metadata.participants : []
        const admins = participants.filter((participant) => participant?.admin === 'admin' || participant?.admin === 'superadmin')
        const groupCaption = [
          `👥 *${metadata.subject || 'Gruppeninfo'}*`,
          '',
          `• Mitglieder: *${participants.length}*`,
          `• Admins: *${admins.length}*`,
          `• Session: *${sessionId}*`,
          `• Beschreibung: ${String(metadata.desc || 'Keine Beschreibung gesetzt.').trim() || 'Keine Beschreibung gesetzt.'}`
        ].join('\n')

        const groupPicture = await resolveProfilePicture(session, chatId)
        if (groupPicture) {
          try {
            await session.sendMessage(chatId, {
              image: { url: groupPicture },
              caption: groupCaption
            }, { quoted: msg })
            break
          } catch {
            // Fallback auf Text
          }
        }

        await sendTextMessage(session, chatId, groupCaption, { quoted: msg })
        break
      }

      case 'welcome': {
        commandHandled = true
        if (!chatId.endsWith('@g.us')) {
          await sendTextMessage(session, chatId, '❌ `welcome` ist nur in Gruppen sinnvoll.', { quoted: msg })
          break
        }

        const groupConfig = ensureGroupSettings(chatId)
        const metadata = await resolveGroupMetadata(session, chatId)
        const subject = metadata?.subject || 'dieser Gruppe'
        const subCommand = String(args[0] || 'status').trim().toLowerCase()
        const restText = args.slice(1).join(' ').trim()

        if (subCommand === 'on') {
          groupConfig.welcomeEnabled = true
          groupConfig.updatedAt = Date.now()
          await saveDatabase()
          await sendTextMessage(session, chatId, `✅ Welcome-System für *${subject}* aktiviert.`, { quoted: msg })
          break
        }

        if (subCommand === 'off') {
          groupConfig.welcomeEnabled = false
          groupConfig.updatedAt = Date.now()
          await saveDatabase()
          await sendTextMessage(session, chatId, `✅ Welcome-System für *${subject}* deaktiviert.`, { quoted: msg })
          break
        }

        if (subCommand === 'set') {
          if (!restText) {
            await sendTextMessage(session, chatId, '❌ Bitte gib nach `welcome set` einen Text an.', { quoted: msg })
            break
          }
          groupConfig.welcomeTemplate = restText
          groupConfig.updatedAt = Date.now()
          await saveDatabase()
          await sendTextMessage(session, chatId, '✅ Welcome-Template gespeichert.', { quoted: msg })
          break
        }

        if (subCommand === 'setbye') {
          if (!restText) {
            await sendTextMessage(session, chatId, '❌ Bitte gib nach `welcome setbye` einen Text an.', { quoted: msg })
            break
          }
          groupConfig.goodbyeTemplate = restText
          groupConfig.updatedAt = Date.now()
          await saveDatabase()
          await sendTextMessage(session, chatId, '✅ Goodbye-Template gespeichert.', { quoted: msg })
          break
        }

        if (subCommand === 'reset') {
          groupConfig.welcomeTemplate = DEFAULT_WELCOME_TEMPLATE
          groupConfig.goodbyeTemplate = DEFAULT_GOODBYE_TEMPLATE
          groupConfig.updatedAt = Date.now()
          await saveDatabase()
          await sendTextMessage(session, chatId, '♻️ Welcome- und Goodbye-Templates wurden zurückgesetzt.', { quoted: msg })
          break
        }

        if (subCommand === 'preview' || subCommand === 'test') {
          const participant = sender
          const memberCount = Array.isArray(metadata?.participants) ? metadata.participants.length : 0
          const previewText = formatWelcomeTemplate({
            template: groupConfig.welcomeTemplate,
            participant,
            subject,
            description: String(metadata?.desc || '').trim() || 'Keine Beschreibung gesetzt.',
            memberCount,
            sessionId
          })
          await sendTextMessage(session, chatId, previewText, { quoted: msg, mentions: [participant] })
          break
        }

        await sendTextMessage(session, chatId, buildWelcomeStatusText(groupConfig, subject), { quoted: msg })
        break
      }

      case 'session-info': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildSessionInfoText(sessionId, session, sender, chatId), { quoted: msg })
        break
      }

      case 'sessions': {
        commandHandled = true
        await sendTextMessage(session, chatId, buildSessionsText(sessionId), { quoted: msg })
        break
      }

      case 'session-start': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const target = normalizeSessionName(args[0] || sessionId || runtimeConfig.bootstrapSessions[0] || DEFAULT_SESSION_NAME)
        try {
          await startSessionByQr(target)
          await sendTextMessage(session, chatId, `✅ Session *${target}* wurde per QR-Flow gestartet.`, { quoted: msg })
        } catch (error) {
          rememberSession(target, { state: 'offline', lastError: error.message, desiredState: 'running' })
          await saveDatabase()
          await sendTextMessage(session, chatId, `❌ Session *${target}* konnte nicht gestartet werden:\n${error.message}`, { quoted: msg })
        }
        break
      }

      case 'session-pair': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }
        if (typeof onimai.startSessionWithPairingCode !== 'function') {
          await sendTextMessage(session, chatId, '❌ Deine wa-api unterstützt aktuell keinen Pairing-Code-Start.', { quoted: msg })
          break
        }

        const maybePhone = args.length === 1 ? args[0] : args[1]
        const maybeSession = args.length === 1 ? sessionId : args[0]
        const target = normalizeSessionName(maybeSession || sessionId || DEFAULT_SESSION_NAME)

        try {
          await startSessionByPairing(target, maybePhone)
          await sendTextMessage(session, chatId, `✅ Pairing für Session *${target}* wurde gestartet.\n\nNutze eine vollständige Nummer wie \`491234567890\`.`, { quoted: msg })
        } catch (error) {
          rememberSession(target, { state: 'offline', lastError: error.message, desiredState: 'running' })
          await saveDatabase()
          await sendTextMessage(session, chatId, `❌ Pairing für *${target}* fehlgeschlagen:\n${error.message}`, { quoted: msg })
        }
        break
      }

      case 'session-pause': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const target = normalizeSessionName(args[0] || sessionId)
        try {
          await pauseKnownSession(target)
          await sendTextMessage(session, chatId, `⏸️ Session *${target}* wurde pausiert.`, { quoted: msg })
        } catch (error) {
          await sendTextMessage(session, chatId, `❌ Pause für *${target || 'unbekannt'}* fehlgeschlagen:\n${error.message}`, { quoted: msg })
        }
        break
      }

      case 'session-resume': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const target = normalizeSessionName(args[0] || sessionId)
        try {
          await resumeKnownSession(target)
          await sendTextMessage(session, chatId, `▶️ Session *${target}* wurde fortgesetzt.`, { quoted: msg })
        } catch (error) {
          await sendTextMessage(session, chatId, `❌ Resume für *${target || 'unbekannt'}* fehlgeschlagen:\n${error.message}`, { quoted: msg })
        }
        break
      }

      case 'session-stop': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const target = normalizeSessionName(args[0] || sessionId)
        try {
          await stopKnownSession(target)
          await sendTextMessage(session, chatId, `⏹️ Session *${target}* wurde gestoppt.`, { quoted: msg })
        } catch (error) {
          await sendTextMessage(session, chatId, `❌ Stop für *${target || 'unbekannt'}* fehlgeschlagen:\n${error.message}`, { quoted: msg })
        }
        break
      }

      case 'session-delete': {
        commandHandled = true
        if (!canManageSessions(sender)) {
          await sendTextMessage(session, chatId, buildSessionManagementDeniedText(), { quoted: msg })
          break
        }

        const target = normalizeSessionName(args[0] || sessionId)
        try {
          await deleteKnownSession(target)
          await sendTextMessage(session, chatId, `🗑️ Session *${target}* wurde aus der Registry entfernt.`, { quoted: msg })
        } catch (error) {
          await sendTextMessage(session, chatId, `❌ Delete für *${target || 'unbekannt'}* fehlgeschlagen:\n${error.message}`, { quoted: msg })
        }
        break
      }

      default: {
        await sendTextMessage(session, chatId, buildUnknownCommandText(command || rawCommand), { quoted: msg })
      }
    }

    if (commandHandled) {
      user.commandCount = (user.commandCount || 0) + 1
      updateCommandStats(command)
      const { leveledUp, level } = grantXp(user, 15)
      await saveDatabase()

      if (leveledUp) {
        await sendTextMessage(session, chatId, `🎉 ${getDisplayMention(sender)} ist jetzt *Level ${level}*!`, {
          quoted: msg,
          mentions: [sender]
        }).catch(() => {})
      }
    }
  } catch (error) {
    console.error('💥 Handler error:', error)
  }
})

process.on('SIGINT', async () => {
  try {
    await saveDatabase()
  } finally {
    process.exit(0)
  }
})

process.on('SIGTERM', async () => {
  try {
    await saveDatabase()
  } finally {
    process.exit(0)
  }
})

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error)
})

const isDirectRun = !!process.argv[1] && path.resolve(process.argv[1]) === __filename

if (isDirectRun) {
  await startRuntime()
}
