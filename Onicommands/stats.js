import { getManagedSessions } from '../utils/multisession.js';

export default {
  name: 'stats',
  aliases: ['runtime', 'botstats'],
  description: 'Zeigt Runtime-, Loader- und Stack-Infos der WhatsApp-Base.',
  async execute({ client, config, reply }) {
    const managedSessions = getManagedSessions(client);
    const stack = config.multiSession.packageStack || {};

    await reply([
      '📊 *OnimaiBot Runtime-Status*',
      `Commands: *${client.commands.size}*`,
      `Buttons: *${client.buttons.size}*`,
      `Menüs: *${client.menus.size}*`,
      `Events: *${client.events.length}*`,
      `Gemanagte Sessions: *${managedSessions.length}*`,
      `Wiederhergestellt: *${client.runtime?.restoredCount ?? 0}*`,
      '',
      `wa-api: *${stack.waApi || '-'}*`,
      `baileys: *${stack.baileys || '-'}*`,
      `libsignal: *${stack.libsignal || '-'}*`,
      `downloader: *${stack.downloader || '-'}*`
    ].join('\n'));
  }
};
