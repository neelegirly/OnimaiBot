import { formatError } from '../utils/errors.js';
import {
  canManageSessions,
  consumeMenuSelection,
  extractInteractiveSelectionId,
  extractTextContent,
  getChatId,
  getSenderId,
  getSenderName,
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
      if (!isUserMessage(message)) {
        return;
      }

      const text = extractTextContent(message);
      const interactiveComponentId = extractInteractiveSelectionId(message);
      const context = createMessageContext({
        client,
        config,
        logger,
        message,
        text
      });

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
