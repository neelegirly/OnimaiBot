import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_WELCOME_TEMPLATE = '🌸 Willkommen {users} in *{group}*! OnimaiBot freut sich auf dich 💜';

const storeLocks = new Map();
const JID_SUFFIX_RE = /@(?:s\.whatsapp\.net|c\.us|lid)$/i;

function createDefaultStore() {
  return {
    profiles: {},
    groups: {}
  };
}

function sanitizeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeProfileKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeGroupKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getStorePath(projectRoot) {
  return path.join(projectRoot, 'data', 'runtime-store.json');
}

function buildTempFilePath(filePath) {
  return `${filePath}.${process.pid}.${Date.now()}.tmp`;
}

function sanitizeProfile(key, value = {}) {
  const now = Date.now();
  const normalizedName = String(
    value?.name
    || value?.registeredName
    || key.split('@')[0]
    || 'Freund'
  ).trim() || 'Freund';

  return {
    senderId: key,
    name: normalizedName,
    registered: value?.registered === true,
    registeredName: value?.registeredName ? String(value.registeredName).trim() || null : null,
    level: Math.max(1, Number(value?.level) || 1),
    xp: Math.max(0, Number(value?.xp) || 0),
    commandCount: Math.max(0, Number(value?.commandCount) || 0),
    createdAt: Number(value?.createdAt) > 0 ? Number(value.createdAt) : now,
    updatedAt: Number(value?.updatedAt) > 0 ? Number(value.updatedAt) : now,
    lastSeenAt: Number(value?.lastSeenAt) > 0 ? Number(value.lastSeenAt) : now,
    registeredAt: Number(value?.registeredAt) > 0 ? Number(value.registeredAt) : null
  };
}

function sanitizeGroupSettings(chatId, value = {}) {
  return {
    chatId,
    welcomeEnabled: value?.welcomeEnabled === true,
    welcomeTemplate: String(value?.welcomeTemplate || DEFAULT_WELCOME_TEMPLATE).trim() || DEFAULT_WELCOME_TEMPLATE,
    updatedAt: Number(value?.updatedAt) > 0 ? Number(value.updatedAt) : null
  };
}

function sanitizeStore(raw) {
  const store = createDefaultStore();
  const profiles = sanitizeObject(raw?.profiles);
  const groups = sanitizeObject(raw?.groups);

  for (const [key, value] of Object.entries(profiles)) {
    const normalizedKey = normalizeProfileKey(key);
    if (!normalizedKey) continue;
    store.profiles[normalizedKey] = sanitizeProfile(normalizedKey, value);
  }

  for (const [key, value] of Object.entries(groups)) {
    const normalizedKey = normalizeGroupKey(key);
    if (!normalizedKey) continue;
    store.groups[normalizedKey] = sanitizeGroupSettings(normalizedKey, value);
  }

  return store;
}

async function readStoreFromDisk(projectRoot) {
  const filePath = getStorePath(projectRoot);

  try {
    const raw = await readFile(filePath, 'utf8');
    return sanitizeStore(JSON.parse(raw));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return createDefaultStore();
    }

    return createDefaultStore();
  }
}

async function writeStoreToDisk(projectRoot, store) {
  const filePath = getStorePath(projectRoot);
  const directoryPath = path.dirname(filePath);
  const tempFilePath = buildTempFilePath(filePath);

  await mkdir(directoryPath, { recursive: true });
  await writeFile(tempFilePath, `${JSON.stringify(sanitizeStore(store), null, 2)}\n`, 'utf8');

  try {
    await rename(tempFilePath, filePath);
  } catch (error) {
    await rm(tempFilePath, { force: true }).catch(() => {});
    throw error;
  }
}

function enqueueStoreOp(projectRoot, operation) {
  const storePath = getStorePath(projectRoot);
  const previous = storeLocks.get(storePath) || Promise.resolve();
  const next = previous
    .catch(() => {})
    .then(operation);

  storeLocks.set(storePath, next.finally(() => {
    if (storeLocks.get(storePath) === next) {
      storeLocks.delete(storePath);
    }
  }));

  return next;
}

async function withRuntimeStore(projectRoot, updater) {
  return enqueueStoreOp(projectRoot, async () => {
    const store = await readStoreFromDisk(projectRoot);
    const result = await updater(store);
    await writeStoreToDisk(projectRoot, store);
    return result;
  });
}

export async function getOrCreateUserProfile(projectRoot, { senderId, displayName = 'Freund' } = {}) {
  const profileKey = normalizeProfileKey(senderId);

  if (!profileKey) {
    throw new Error('senderId fehlt für das Runtime-Profil.');
  }

  return withRuntimeStore(projectRoot, (store) => {
    const now = Date.now();
    const existing = sanitizeProfile(profileKey, store.profiles[profileKey] || {});
    const next = {
      ...existing,
      name: existing.registeredName || String(displayName || existing.name || 'Freund').trim() || existing.name,
      lastSeenAt: now,
      updatedAt: now
    };

    store.profiles[profileKey] = next;
    return next;
  });
}

export async function touchUserProfile(projectRoot, {
  senderId,
  displayName = 'Freund',
  incrementCommandCount = false
} = {}) {
  const profileKey = normalizeProfileKey(senderId);

  if (!profileKey) {
    return null;
  }

  return withRuntimeStore(projectRoot, (store) => {
    const now = Date.now();
    const existing = sanitizeProfile(profileKey, store.profiles[profileKey] || {});
    const next = {
      ...existing,
      name: existing.registeredName || String(displayName || existing.name || 'Freund').trim() || existing.name,
      commandCount: incrementCommandCount ? existing.commandCount + 1 : existing.commandCount,
      lastSeenAt: now,
      updatedAt: now
    };

    store.profiles[profileKey] = next;
    return next;
  });
}

export async function registerUserProfile(projectRoot, { senderId, displayName = 'Freund' } = {}) {
  const profileKey = normalizeProfileKey(senderId);
  const safeName = String(displayName || 'Freund').trim() || 'Freund';

  if (!profileKey) {
    throw new Error('senderId fehlt für die Registrierung.');
  }

  return withRuntimeStore(projectRoot, (store) => {
    const now = Date.now();
    const existing = sanitizeProfile(profileKey, store.profiles[profileKey] || {});
    const next = {
      ...existing,
      name: safeName,
      registered: true,
      registeredName: safeName,
      registeredAt: existing.registeredAt || now,
      lastSeenAt: now,
      updatedAt: now
    };

    store.profiles[profileKey] = next;
    return next;
  });
}

export async function getGroupWelcomeSettings(projectRoot, chatId) {
  const groupKey = normalizeGroupKey(chatId);

  if (!groupKey) {
    throw new Error('chatId fehlt für Welcome-Einstellungen.');
  }

  const store = await readStoreFromDisk(projectRoot);
  return sanitizeGroupSettings(groupKey, store.groups[groupKey] || {});
}

export async function updateGroupWelcomeSettings(projectRoot, chatId, patch = {}) {
  const groupKey = normalizeGroupKey(chatId);

  if (!groupKey) {
    throw new Error('chatId fehlt für Welcome-Einstellungen.');
  }

  return withRuntimeStore(projectRoot, (store) => {
    const next = sanitizeGroupSettings(groupKey, {
      ...store.groups[groupKey],
      ...patch,
      updatedAt: Date.now()
    });

    store.groups[groupKey] = next;
    return next;
  });
}

export function extractParticipantJids(values = []) {
  const entries = Array.isArray(values) ? values : [values];
  const normalized = entries
    .map((value) => String(value || '').trim())
    .filter((value) => JID_SUFFIX_RE.test(value));

  return [...new Set(normalized)];
}

export function formatMentionTag(jid = '') {
  const local = String(jid || '')
    .trim()
    .replace(/:\d+(?=@)/, '')
    .split('@')[0];

  return local ? `@${local}` : '@neu';
}

export function renderWelcomeTemplate(template, {
  mentionJids = [],
  groupName = 'deiner Gruppe',
  action = 'beigetreten',
  sessionId = ''
} = {}) {
  const safeTemplate = String(template || DEFAULT_WELCOME_TEMPLATE).trim() || DEFAULT_WELCOME_TEMPLATE;
  const mentionTags = extractParticipantJids(mentionJids).map((jid) => formatMentionTag(jid));
  const replacements = {
    '{user}': mentionTags[0] || '@neu',
    '{users}': mentionTags.join(' ') || '@neu',
    '{group}': String(groupName || 'deiner Gruppe').trim() || 'deiner Gruppe',
    '{action}': String(action || 'beigetreten').trim() || 'beigetreten',
    '{session}': String(sessionId || '').trim() || '-'
  };

  let output = safeTemplate;

  for (const [token, value] of Object.entries(replacements)) {
    output = output.replaceAll(token, value);
  }

  return output;
}
