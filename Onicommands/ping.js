export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Prüft, ob OnimaiBaseV3 erreichbar ist.',
  async execute({ config, reply, sessionId }) {
    const uptimeSeconds = Math.floor(process.uptime());

    await reply([
      '🏓 *Pong!*',
      'OnimaiBaseV3 läuft als *wa-api Multi-Session-Bot*.',
      `Session: *${sessionId}*`,
      `Prefix: *${config.whatsapp.prefix}*`,
      `Uptime: *${uptimeSeconds}s*`
    ].join('\n'));
  }
};
