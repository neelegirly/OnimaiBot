import { createDemoMenuMessages } from '../components/demoMenuLayout.js';

export default {
  name: 'menu',
  aliases: ['help', 'hilfe'],
  description: 'Zeigt die einfachen Beispiel-Funktionen von OnimaiBaseV3.',
  async execute({ config, logger, rememberMenu, reply }) {
    const { introText, buttonMessage, listMessage, fallbackText, fallbackMap } = createDemoMenuMessages(config.whatsapp.prefix);

    await reply(introText);

    try {
      await reply(buttonMessage);
    } catch (error) {
      logger.warn('Native WhatsApp-Buttons konnten nicht gesendet werden.', {
        message: error instanceof Error ? error.message : String(error)
      });
    }

    try {
      await reply(listMessage);
    } catch (error) {
      logger.warn('Native WhatsApp-Liste konnte nicht gesendet werden.', {
        message: error instanceof Error ? error.message : String(error)
      });
    }

    await reply(fallbackText);
    rememberMenu(fallbackMap);
  }
};
