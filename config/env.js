import dotenv from 'dotenv';

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function loadEnv(overrides = {}) {
  const raw = {
    ...process.env,
    ...overrides
  };

  const env = {
    appName: raw.APP_NAME || 'OnimaiBaseV3',
    nodeEnv: raw.NODE_ENV || 'development',
    logLevel: raw.LOG_LEVEL || 'info',
    botPrefix: raw.BOT_PREFIX || '!',
    printQr: parseBoolean(raw.WHATSAPP_PRINT_QR, true),
    ownerNumbers: parseList(raw.BOT_OWNER_NUMBERS),
    bootstrapSessions: parseList(raw.WA_API_BOOTSTRAP_SESSIONS || 'main-session'),
    retryLimit: parseInteger(raw.WA_API_RETRY_LIMIT, 10),
    dryRun: parseBoolean(raw.ONIMAIBASEV3_DRY_RUN, true)
  };

  return {
    env,
    missing: []
  };
}
