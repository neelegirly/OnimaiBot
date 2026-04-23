import { normalizePhoneNumber, sanitizeSessionId } from '../utils/multisession.js';

export default {
  name: 'session-pair',
  aliases: ['session-code', 'session-pairing'],
  description: 'Startet eine Session direkt mit Pairing-Code.',
  async execute({ args, client, config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Befehl ist nur für Owner gedacht. Trage `BOT_OWNER_NUMBERS` in der `.env` ein.');
      return;
    }

    const sessionId = sanitizeSessionId(args[0]);
    const phoneNumber = normalizePhoneNumber(args[1]);

    if (!sessionId || !phoneNumber) {
      await reply([
        `Nutze: *${config.whatsapp.prefix}session-pair <session-id> <telefonnummer>*`,
        `Beispiel: *${config.whatsapp.prefix}session-pair support 491234567890*`,
        'Wichtig: Bei wa-api muss die Telefonnummer bereits beim Start mitgegeben werden.'
      ].join('\n'));
      return;
    }

    await client.waApi.startSessionWithPairingCode(sessionId, {
      phoneNumber,
      autoStart: true
    });

    await reply([
      `🔑 Pairing-Flow für *${sessionId}* gestartet.`,
      `Telefonnummer: *${phoneNumber}*`,
      'Der Pairing-Code erscheint direkt im Terminal-Log.'
    ].join('\n'));
  }
};
