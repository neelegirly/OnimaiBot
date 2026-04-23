import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.details,
  async execute({ reply }) {
    await reply([
      '*OnimaiBaseV3 Details*',
      '• `Onicommands/` enthält die einfachen Beispiel-Befehle wie `ping` und `menu`.',
      '• `main.js` ist jetzt der offizielle Startpunkt der Base.',
      '• `events/` verarbeitet Verbindung und eingehende Nachrichten.',
      '• `components/buttons/` und `components/menus/` kapseln Interaktionen separat.',
      '• `config/` und `.env` halten Laufzeitwerte aus dem Code heraus.'
    ].join('\n'));
  }
};
