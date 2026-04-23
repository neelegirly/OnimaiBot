import { isOwnerNumber } from './multisession.js';

function unwrapMessageContent(content) {
  if (!content) {
    return {};
  }

  if (content.ephemeralMessage?.message) {
    return unwrapMessageContent(content.ephemeralMessage.message);
  }

  if (content.viewOnceMessage?.message) {
    return unwrapMessageContent(content.viewOnceMessage.message);
  }

  if (content.viewOnceMessageV2?.message) {
    return unwrapMessageContent(content.viewOnceMessageV2.message);
  }

  return content;
}

export function extractTextContent(message) {
  const content = unwrapMessageContent(message?.message);

  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedDisplayText ||
    content.listResponseMessage?.title ||
    content.templateButtonReplyMessage?.selectedDisplayText ||
    content.interactiveResponseMessage?.body?.text ||
    ''
  ).trim();
}

export function extractInteractiveSelectionId(message) {
  const content = unwrapMessageContent(message?.message);

  if (content.buttonsResponseMessage?.selectedButtonId) {
    return content.buttonsResponseMessage.selectedButtonId;
  }

  if (content.templateButtonReplyMessage?.selectedId) {
    return content.templateButtonReplyMessage.selectedId;
  }

  if (content.listResponseMessage?.singleSelectReply?.selectedRowId) {
    return content.listResponseMessage.singleSelectReply.selectedRowId;
  }

  const paramsJson = content.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;

  if (!paramsJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(paramsJson);
    return parsed.id || parsed.selectedId || parsed.selectedRowId || null;
  } catch {
    return null;
  }
}

export function getChatId(message) {
  return message?.key?.remoteJid || null;
}

export function getSenderId(message) {
  return message?.key?.participant || getChatId(message);
}

export function getSenderName(message) {
  const senderId = getSenderId(message);
  return message?.pushName || senderId?.split('@')[0] || 'Freund';
}

export function isUserMessage(message) {
  const chatId = getChatId(message);

  if (!message?.message || !chatId) {
    return false;
  }

  if (message.key?.fromMe) {
    return false;
  }

  return !chatId.endsWith('@broadcast');
}

export function parseCommand(text, prefix) {
  if (!text) {
    return null;
  }

  if (!text.startsWith(prefix)) {
    return null;
  }

  const cleaned = text.slice(prefix.length).trim();

  if (!cleaned) {
    return null;
  }

  const [name, ...args] = cleaned.split(/\s+/);

  return {
    name: name.toLowerCase(),
    args,
    rawArgs: args.join(' ')
  };
}

function getMenuScopeKey(sessionId, chatId) {
  return `${sessionId}::${chatId}`;
}

export function rememberMenuSession(client, sessionId, chatId, mapping) {
  client.menuSessions.set(getMenuScopeKey(sessionId, chatId), {
    mapping,
    expiresAt: Date.now() + 10 * 60 * 1000
  });
}

export function consumeMenuSelection(client, sessionId, chatId, text) {
  const key = getMenuScopeKey(sessionId, chatId);
  const session = client.menuSessions.get(key);

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    client.menuSessions.delete(key);
    return null;
  }

  const selectedComponentId = session.mapping[String(text).trim()] || null;

  if (selectedComponentId) {
    client.menuSessions.delete(key);
  }

  return selectedComponentId;
}

export function canManageSessions(senderId, config) {
  return isOwnerNumber(senderId, config);
}

export async function safeReply(waApi, sessionId, chatId, payload, quotedMessage) {
  const normalizedPayload = typeof payload === 'string' ? { text: payload } : payload;
  return waApi.sendMessage(sessionId, chatId, normalizedPayload, quotedMessage ? { quoted: quotedMessage } : undefined);
}