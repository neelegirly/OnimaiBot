import { sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-resume',
  aliases: ['session-continue'],
  description: 'Nimmt eine pausierte oder gestoppte Session wieder auf.',
  async execute({ args, client, config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);

    if (!sessionId) {
      await reply(`Nutze: *${config.whatsapp.prefix}session-resume <session-id>*`);
      return;
    }

    await client.waApi.resumeSession(sessionId);
    await reply(`▶️ Session *${sessionId}* wurde wieder aufgenommen.`);
  }
};
