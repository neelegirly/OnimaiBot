import { DEMO_COMPONENT_IDS } from '../demoMenuLayout.js';

export default {
  customId: DEMO_COMPONENT_IDS.setup,
  async execute({ config, reply }) {
    await reply([
      '*OnimaiBaseV3 Setup & Struktur*',
      `• Prefix: ${config.whatsapp.prefix}`,
      '• Session-Dateien landen lokal im Ordner `auth/`.',
      '• Für die erste Live-Verbindung `ONIMAIBASEV3_DRY_RUN=false` setzen und neu starten.',
      '• PM2 startet die App konsistent unter dem Namen `OnimaiBaseV3`.'
    ].join('\n'));
  }
};
