export default {
  name: 'about',
  aliases: ['info', 'botinfo'],
  description: 'Zeigt eine kurze Übersicht über OnimaiBot und den aktuellen WhatsApp-Stack.',
  async execute({ client, config, reply }) {
    const stack = config.multiSession.packageStack || {};

    await reply([
      '✨ *OnimaiBot*',
      'Eine moderne, einfache und erweiterbare WhatsApp Multi-Session Base — ohne Discord-Altlasten.',
      '',
      `Prefix: *${config.whatsapp.prefix}*`,
      `Geladene Commands: *${client.commands.size}*`,
      `Gemanagte Sessions: *${client.waApi.getAllManagedSessions?.().length || 0}*`,
      `Stack: *@neelegirly/wa-api ${stack.waApi || '-'}*, *@neelegirly/baileys ${stack.baileys || '-'}*, *@neelegirly/libsignal ${stack.libsignal || '-'}*`,
      `Downloader: *@neelegirly/downloader ${stack.downloader || '-'}*`,
      'Direkt eingebaut: Profile, Tagall, Welcome-Templates und Session-Helfer.',
      '💜 *Powered by Neelegirly*'
    ].join('\n'));
  }
};
