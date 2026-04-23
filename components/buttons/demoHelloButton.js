import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.hello,
  async execute({ reply, senderName }) {
    await reply(`🌸 Hallo *${senderName}*! Du hast erfolgreich die erste OnimaiBaseV3-Demo-Aktion in WhatsApp ausgelöst.`);
  }
};
