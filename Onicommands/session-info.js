import { normalizeSenderNumber } from '../utils/multisession.js';

export default {
  name: 'session-info',
  aliases: ['sid', 'mysession'],
  description: 'Zeigt Infos zur aktuellen Session, zum Absender und zum Zugriff.',
  async execute({ config, isOwner, reply, senderId, senderName, sessionId }) {
    const senderNumber = normalizeSenderNumber(senderId);

    await reply([
      '📱 *Session-Info*',
      `Session: *${sessionId}*`,
      `Name: *${senderName || 'Unbekannt'}*`,
      `Nummer: *${senderNumber || 'unbekannt'}*`,
      `Owner-Rechte: *${isOwner ? 'ja' : 'nein'}*`,
      `Prefix: *${config.whatsapp.prefix}*`,
      `Bootstrap-Sessions: *${config.multiSession.bootstrapSessions.join(', ') || 'keine'}*`
    ].join('\n'));
  }
};
