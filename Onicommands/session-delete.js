import { sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-delete',
  aliases: ['session-remove'],
  description: 'Löscht Session, Registry-Eintrag und Credentials vollständig.',
  async execute({ args, client, config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);

    if (!sessionId) {
      await reply(`Nutze: *${config.whatsapp.prefix}session-delete <session-id>*`);
      return;
    }

    await client.waApi.deleteSession(sessionId);
    await reply(`🧹 Session *${sessionId}* wurde komplett gelöscht.`);
  }
};
