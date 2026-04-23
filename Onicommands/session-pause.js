import { sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-pause',
  aliases: ['session-break'],
  description: 'Pausiert eine Session ohne Credentials zu löschen.',
  async execute({ args, client, config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);

    if (!sessionId) {
      await reply(`Nutze: *${config.whatsapp.prefix}session-pause <session-id>*`);
      return;
    }

    await client.waApi.pauseSession(sessionId);
    await reply(`⏸️ Session *${sessionId}* wurde pausiert.`);
  }
};
