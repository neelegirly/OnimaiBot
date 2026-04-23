export default {
  name: 'about',
  aliases: ['info', 'botinfo'],
  description: 'Zeigt eine kurze Übersicht über OnimaiBot und den Neelegirly-Stack.',
  async execute({ client, config, reply }) {
    await reply([
      '✨ *OnimaiBot / OnimaiBaseV3*',
      'Eine moderne, einfache und erweiterbare WhatsApp Multi-Session Base.',
      '',
      `Prefix: *${config.whatsapp.prefix}*`,
      `Geladene Commands: *${client.commands.size}*`,
      `Gemanagte Sessions: *${client.waApi.getAllManagedSessions?.().length || 0}*`,
      'Stack: *@neelegirly/wa-api*, *@neelegirly/baileys*, *@neelegirly/libsignal*',
      '💜 *Powered by Neelegirly*'
    ].join('\n'));
  }
};
