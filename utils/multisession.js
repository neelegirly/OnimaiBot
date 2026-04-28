const ACTIVE_SESSION_STATUSES = new Set(['starting', 'connecting', 'running', 'connected']);

export function sanitizeSessionId(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizePhoneNumber(input) {
  return String(input || '').replace(/\D+/g, '');
}

export function normalizeSenderNumber(senderId) {
  return normalizePhoneNumber(String(senderId || '').split('@')[0]);
}

export function isOwnerNumber(senderId, config) {
  const owners = config?.whatsapp?.ownerNumbers || [];

  if (owners.length === 0) {
    return true;
  }

  return owners.includes(normalizeSenderNumber(senderId));
}

export function getManagedSessions(client) {
  const managed = client.waApi.getAllManagedSessions?.() || [];
  return Array.isArray(managed) ? managed : [];
}

export function getSessionStatus(client, sessionId) {
  return client.waApi.getSessionStatus?.(sessionId) || 'unknown';
}

export function getSessionClient(client, sessionId) {
  return client?.waApi?.getSession?.(sessionId) || null;
}

export async function getGroupMetadataForSession(client, sessionId, chatId) {
  const session = getSessionClient(client, sessionId);

  if (!session || !chatId) {
    return null;
  }

  if (typeof session.groupMetadata === 'function') {
    return session.groupMetadata(chatId);
  }

  if (typeof session.getGroupMetadata === 'function') {
    return session.getGroupMetadata(chatId);
  }

  return null;
}

export function formatSessionEntry(client, entry) {
  if (typeof entry === 'string') {
    return {
      sessionId: entry,
      status: getSessionStatus(client, entry),
      desiredState: null,
      phoneNumber: null,
      runtimeOnline: ACTIVE_SESSION_STATUSES.has(getSessionStatus(client, entry))
    };
  }

  const sessionId = entry?.sessionId || entry?.id || entry?.name || 'unknown-session';
  const status = entry?.status || entry?.lifecycleStatus || entry?.runtimeStatus || getSessionStatus(client, sessionId);

  return {
    sessionId,
    status,
    desiredState: entry?.desiredState || null,
    phoneNumber: entry?.phoneNumber || entry?.wid || entry?.jid || null,
    runtimeOnline: entry?.runtimeOnline ?? ACTIVE_SESSION_STATUSES.has(status)
  };
}

export async function ensureSessionRunning({ client, config, logger, sessionId }) {
  const normalizedSessionId = sanitizeSessionId(sessionId);

  if (!normalizedSessionId) {
    throw new Error('Session-ID ist leer oder ungültig.');
  }

  const previousStatus = getSessionStatus(client, normalizedSessionId);

  if (previousStatus === 'paused' || previousStatus === 'stopped') {
    await client.waApi.resumeSession(normalizedSessionId);

    logger.info('Session wurde wieder aufgenommen.', {
      sessionId: normalizedSessionId,
      previousStatus
    });

    return {
      sessionId: normalizedSessionId,
      action: 'resumed',
      previousStatus,
      currentStatus: getSessionStatus(client, normalizedSessionId)
    };
  }

  if (ACTIVE_SESSION_STATUSES.has(previousStatus)) {
    return {
      sessionId: normalizedSessionId,
      action: 'already-active',
      previousStatus,
      currentStatus: previousStatus
    };
  }

  await client.waApi.startSession(normalizedSessionId, {
    printQR: config.whatsapp.printQr,
    autoStart: true,
    retryLimit: config.multiSession.retryLimit
  });

  logger.info('Session wurde gestartet.', {
    sessionId: normalizedSessionId,
    previousStatus
  });

  return {
    sessionId: normalizedSessionId,
    action: 'started',
    previousStatus,
    currentStatus: getSessionStatus(client, normalizedSessionId)
  };
}

export function formatManagedSessions(client) {
  const managed = getManagedSessions(client).map((entry) => formatSessionEntry(client, entry));

  if (managed.length === 0) {
    return 'Noch keine Sessions vorhanden. Nutze `!session-start main-session` oder `!session-pair support 491234567890`.';
  }

  return managed
    .map((entry) => {
      const phoneChunk = entry.phoneNumber ? ` · ${entry.phoneNumber}` : '';
      const desiredChunk = entry.desiredState ? ` · desired=${entry.desiredState}` : '';
      return `• ${entry.sessionId} → ${entry.status}${desiredChunk}${phoneChunk}`;
    })
    .join('\n');
}