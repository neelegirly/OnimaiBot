import { WAMessageStubType } from '@neelegirly/baileys';
import { formatError } from '../utils/errors.js';
import { getGroupMetadataForSession } from '../utils/multisession.js';
import {
  extractParticipantJids,
  formatMentionTag,
  getGroupWelcomeSettings,
  renderWelcomeTemplate,
  touchUserProfile
} from '../utils/runtimeStore.js';
import {
  canManageSessions,
  consumeMenuSelection,
  extractInteractiveSelectionId,
  extractTextContent,
  getChatId,
  getSenderId,
  getSenderName,
  isGroupChat,
  isUserMessage,
  parseCommand,
  rememberMenuSession,
  safeReply
} from '../utils/whatsapp.js';

function createMessageContext({ client, config, logger, message, text }) {
  const chatId = getChatId(message);
  const sessionId = message?.sessionId || 'unknown-session';

  return {
    client,
    waApi: client.waApi,
    config,
    logger,
    message,
    text,
    sessionId,
    chatId,
    senderId: getSenderId(message),
    senderName: getSenderName(message),
    isOwner: canManageSessions(getSenderId(message), config),
    reply: (payload) => safeReply(client.waApi, sessionId, chatId, payload, message),
    rememberMenu: (mapping) => rememberMenuSession(client, sessionId, chatId, mapping)
  };
}

const WELCOME_STUB_TYPES = new Set([
  WAMessageStubType.GROUP_PARTICIPANT_ADD,
  WAMessageStubType.GROUP_PARTICIPANT_INVITE,
  WAMessageStubType.GROUP_PARTICIPANT_ACCEPT,
  WAMessageStubType.GROUP_PARTICIPANT_LINKED_GROUP_JOIN,
  WAMessageStubType.GROUP_PARTICIPANT_JOINED_GROUP_AND_PARENT_GROUP
].filter((value) => Number.isInteger(value)));

function resolveWelcomeAction(stubType) {
  if (stubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE) {
    return 'eingeladen';
  }

  if (stubType === WAMessageStubType.GROUP_PARTICIPANT_ACCEPT) {
    return 'akzeptiert und beigetreten';
  }

  return 'beigetreten';
}

async function maybeHandleGroupWelcome({ client, config, logger, message, context }) {
  const stubType = Number(message?.messageStubType || 0);

  if (!context.chatId || !isGroupChat(context.chatId) || !WELCOME_STUB_TYPES.has(stubType)) {
    return false;
  }

  const settings = await getGroupWelcomeSettings(config.projectRoot, context.chatId);

  if (!settings.welcomeEnabled) {
    return false;
  }

  const participantJids = extractParticipantJids(message?.messageStubParameters || []);

  if (participantJids.length === 0 && context.senderId && context.senderId !== context.chatId) {
    participantJids.push(context.senderId);
  }

  if (participantJids.length === 0) {
    return false;
  }

  let groupName = context.chatId;

  try {
    const metadata = await getGroupMetadataForSession(client, context.sessionId, context.chatId);
    groupName = metadata?.subject || groupName;
  } catch (error) {
    logger.warn('Gruppenmetadaten für Welcome konnten nicht geladen werden.', {
      message: error instanceof Error ? error.message : String(error)
    });
  }

  if ((!groupName || groupName === context.chatId) && Array.isArray(message?.messageStubParameters)) {
    const subjectCandidate = message.messageStubParameters.find((entry) => !String(entry || '').includes('@'));
    if (subjectCandidate) {
      groupName = String(subjectCandidate).trim();
    }
  }

  const welcomeText = renderWelcomeTemplate(settings.welcomeTemplate, {
    mentionJids: participantJids,
    groupName: groupName || 'deiner Gruppe',
    action: resolveWelcomeAction(stubType),
    sessionId: context.sessionId
  });

  try {
    await client.waApi.sendMessage(context.sessionId, context.chatId, {
      text: welcomeText,
      mentions: participantJids
    });
    return true;
  } catch (error) {
    logger.warn('Welcome-Nachricht konnte nicht gesendet werden.', {
      message: error instanceof Error ? error.message : String(error),
      participants: participantJids.map((jid) => formatMentionTag(jid))
    });
    return false;
  }
}

async function dispatchComponent({ client, context, componentId, logger }) {
  const component = client.buttons.get(componentId) || client.menus.get(componentId);

  if (!component) {
    logger.warn('Unbekannte Komponente empfangen.', { componentId });
    await context.reply(`ℹ️ Diese Aktion ist nicht registriert: ${componentId}`);
    return;
  }

  await component.execute({
    ...context,
    componentId
  });
}

export default {
  name: 'message.received',
  async execute({ client, config, logger }, message) {
    const chatId = getChatId(message);

    try {
      const text = extractTextContent(message);
      const context = createMessageContext({
        client,
        config,
        logger,
        message,
        text
      });

      if (await maybeHandleGroupWelcome({ client, config, logger, message, context })) {
        return;
      }

      if (!isUserMessage(message)) {
        return;
      }

      const interactiveComponentId = extractInteractiveSelectionId(message);

      if (interactiveComponentId) {
        await dispatchComponent({
          client,
          context,
          componentId: interactiveComponentId,
          logger
        });
        return;
      }

      if (!text) {
        return;
      }

      const fallbackComponentId = consumeMenuSelection(client, context.sessionId, chatId, text);

      if (fallbackComponentId) {
        await dispatchComponent({
          client,
          context,
          componentId: fallbackComponentId,
          logger
        });
        return;
      }

      const commandInput = parseCommand(text, config.whatsapp.prefix);

      if (!commandInput) {
        return;
      }

      await touchUserProfile(config.projectRoot, {
        senderId: context.senderId,
        displayName: context.senderName,
        incrementCommandCount: true
      }).catch((error) => {
        logger.warn('Runtime-Profil konnte nicht aktualisiert werden.', {
          message: error instanceof Error ? error.message : String(error)
        });
      });

      const command = client.commands.get(commandInput.name) || client.commandAliases.get(commandInput.name);

      if (!command) {
        await context.reply(`❓ Unbekannter Command: *${commandInput.name}*\nNutze *${config.whatsapp.prefix}menu* oder *${config.whatsapp.prefix}sessions*.`);
        return;
      }

      await command.execute({
        ...context,
        commandName: command.name,
        args: commandInput.args,
        rawArgs: commandInput.rawArgs
      });
    } catch (error) {
      logger.error('Verarbeitung einer eingehenden Nachricht fehlgeschlagen.', formatError(error));

      if (chatId) {
        await safeReply(
          client.waApi,
          message?.sessionId || 'unknown-session',
          chatId,
          '❌ Beim Verarbeiten deiner Nachricht ist ein Fehler aufgetreten.',
          message
        ).catch(() => {});
      }
    }
  }
};
