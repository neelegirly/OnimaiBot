export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Prüft, ob OnimaiBaseV3 erreichbar ist.',
  async execute({ config, reply }) {
    const uptimeSeconds = Math.floor(process.uptime());

    await reply([
      '🏓 *Pong!*',
      'OnimaiBaseV3 läuft sauber als *WhatsApp-Bot*.',
      `Prefix: *${config.whatsapp.prefix}*`,
      `Uptime: *${uptimeSeconds}s*`
    ].join('\n'));
  }
};
