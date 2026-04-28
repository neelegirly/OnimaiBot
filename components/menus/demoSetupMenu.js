import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.setup,
  async execute({ config, reply }) {
    await reply([
      '*OnimaiBot Setup & Multi-Session*',
      `• Prefix: ${config.whatsapp.prefix}`,
      `• Bootstrap-Sessions: ${config.multiSession.bootstrapSessions.join(', ') || 'keine'}`,
      '• wa-api speichert Sessions standardmäßig unter `sessions_neelegirly/`.',
      '• Für den ersten Live-Start `ONIMAIBOT_DRY_RUN=false` setzen und neu starten.',
      '• Pairing-Starts brauchen die Telefonnummer bereits direkt im Startbefehl.',
      '• Welcome-Nachrichten werden über Gruppen-Systemmeldungen in WhatsApp ausgelöst.'
    ].join('\n'));
  }
};
