import { ensureSessionRunning, sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-start',
  aliases: ['session-add', 'session-run'],
  description: 'Startet oder reaktiviert eine Session per QR.',
  async execute({ args, config, isOwner, logger, client, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht. Trage `BOT_OWNER_NUMBERS` in der `.env` ein.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);

    if (!sessionId) {
      await reply(`Nutze: *${config.whatsapp.prefix}session-start <session-id>*\nBeispiel: *${config.whatsapp.prefix}session-start support*`);
      return;
    }

    const result = await ensureSessionRunning({
      client,
      config,
      logger,
      sessionId
    });

    await reply([
      `🚀 Session *${result.sessionId}* verarbeitet.`,
      `Aktion: *${result.action}*`,
      `Vorher: *${result.previousStatus}*`,
      `Jetzt: *${result.currentStatus}*`,
      'Falls ein QR nötig ist, erscheint er direkt im Terminal.'
    ].join('\n'));
  }
};
