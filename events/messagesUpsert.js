import { formatError } from '../utils/errors.js';
import {
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

  return {
    client,
    socket: client.socket,
    config,
    logger,
    message,
    text,
    chatId,
    senderId: getSenderId(message),
    senderName: getSenderName(message),
    reply: (payload) => safeReply(client.socket, chatId, payload, message),
    rememberMenu: (mapping) => rememberMenuSession(client, chatId, mapping)
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
  name: 'messages.upsert',
  async execute({ client, config, logger }, payload) {
    for (const message of payload.messages ?? []) {
      const chatId = getChatId(message);

      try {
        if (!isUserMessage(message)) {
          continue;
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
          continue;
        }

        if (!text) {
          continue;
        }

        const fallbackComponentId = consumeMenuSelection(client, chatId, text);

        if (fallbackComponentId) {
          await dispatchComponent({
            client,
            context,
            componentId: fallbackComponentId,
            logger
          });
          continue;
        }

        const commandInput = parseCommand(text, config.whatsapp.prefix);

        if (!commandInput) {
          continue;
        }

        const command = client.commands.get(commandInput.name) || client.commandAliases.get(commandInput.name);

        if (!command) {
          await context.reply(`❓ Unbekannter Command: *${commandInput.name}*\nNutze *${config.whatsapp.prefix}menu* für die Demo.`);
          continue;
        }

        await command.execute({
          ...context,
          commandName: command.name,
          args: commandInput.args,
          rawArgs: commandInput.rawArgs
        });
      } catch (error) {
        logger.error('Verarbeitung einer eingehenden Nachricht fehlgeschlagen.', formatError(error));

        if (chatId && client.socket) {
          await safeReply(
            client.socket,
            chatId,
            '❌ Beim Verarbeiten deiner Nachricht ist ein Fehler aufgetreten.',
            message
          ).catch(() => {});
        }
      }
    }
  }
};
