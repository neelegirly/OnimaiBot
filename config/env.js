import dotenv from 'dotenv';

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
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
    sessionDir: raw.WHATSAPP_SESSION_DIR || 'auth',
    printQr: parseBoolean(raw.WHATSAPP_PRINT_QR, true),
    dryRun: parseBoolean(raw.ONIMAIBASEV3_DRY_RUN, true)
  };

  return {
    env,
    missing: []
  };
}
