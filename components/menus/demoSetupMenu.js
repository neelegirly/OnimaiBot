import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.setup,
  async execute({ config, reply }) {
    await reply([
      '*OnimaiBaseV3 Setup & Multi-Session*',
      `• Prefix: ${config.whatsapp.prefix}`,
      `• Bootstrap-Sessions: ${config.multiSession.bootstrapSessions.join(', ') || 'keine'}`,
      '• wa-api speichert Sessions standardmäßig unter `sessions_neelegirly/`.',
      '• Für den ersten Live-Start `ONIMAIBASEV3_DRY_RUN=false` setzen und neu starten.',
      '• Pairing-Starts brauchen die Telefonnummer bereits direkt im Startbefehl.'
    ].join('\n'));
  }
};
