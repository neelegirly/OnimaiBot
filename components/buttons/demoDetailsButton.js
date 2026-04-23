import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.details,
  async execute({ reply }) {
    await reply([
      '*OnimaiBaseV3 Details*',
      '• `Onicommands/` enthält jetzt auch Multi-Session-Lifecycle-Befehle.',
      '• `main.js` startet die PM2-ready wa-api Basis und lädt Sessions aus der Registry.',
      '• `events/` verarbeitet wa-api Listener wie `onMessageReceived` und Session-Statuswechsel.',
      '• `components/buttons/` und `components/menus/` kapseln Interaktionen separat.',
      '• `config/` und `.env` halten Prefix, Owner-Nummern und Bootstrap-Sessions aus dem Code heraus.'
    ].join('\n'));
  }
};
