import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.details,
  async execute({ reply }) {
    await reply([
      '*OnimaiBot Details*',
      '• `Onicommands/` enthält jetzt auch Register-, Profil-, Tagall-, Stats- und Welcome-Befehle.',
      '• `main.js` startet die PM2-ready wa-api Basis und lädt Sessions aus der Registry.',
      '• `events/` verarbeitet wa-api Listener wie `onMessageReceived` und Session-Statuswechsel.',
      '• `components/buttons/` und `components/menus/` kapseln Interaktionen separat.',
      '• `config/` und `.env` halten Prefix, Owner-Nummern und Bootstrap-Sessions aus dem Code heraus.',
      '• Welcome-Nachrichten reagieren direkt auf WhatsApp-Gruppen-Systemmeldungen.'
    ].join('\n'));
  }
};
