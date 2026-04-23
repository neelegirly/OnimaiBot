import { sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-stop',
  aliases: ['session-off'],
  description: 'Stoppt eine Session ohne Credentials zu löschen.',
  async execute({ args, client, config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);

    if (!sessionId) {
      await reply(`Nutze: *${config.whatsapp.prefix}session-stop <session-id>*`);
      return;
    }

    await client.waApi.stopSession(sessionId);
    await reply(`🛑 Session *${sessionId}* wurde gestoppt.`);
  }
};
