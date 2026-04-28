export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Prüft, ob OnimaiBot erreichbar ist.',
  async execute({ config, reply, sessionId }) {
    const uptimeSeconds = Math.floor(process.uptime());

    await reply([
      '🏓 *Pong!*',
      'OnimaiBot läuft als *wa-api Multi-Session-Bot*.',
      `Session: *${sessionId}*`,
      `Prefix: *${config.whatsapp.prefix}*`,
      `Uptime: *${uptimeSeconds}s*`
    ].join('\n'));
  }
};
