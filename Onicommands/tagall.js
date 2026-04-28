import { getGroupMetadataForSession } from '../utils/multisession.js';
import { formatMentionTag } from '../utils/runtimeStore.js';
import { isGroupChat } from '../utils/whatsapp.js';

export default {
  name: 'tagall',
  aliases: ['alle', 'notifyall'],
  description: 'Markiert alle Teilnehmer einer WhatsApp-Gruppe.',
  async execute({ client, chatId, reply, sessionId }) {
    if (!isGroupChat(chatId)) {
      await reply('❌ `tagall` funktioniert nur in WhatsApp-Gruppen.');
      return;
    }

    const metadata = await getGroupMetadataForSession(client, sessionId, chatId);
    const participantIds = (metadata?.participants || [])
      .map((entry) => entry?.id || entry?.jid || null)
      .filter(Boolean);

    if (participantIds.length === 0) {
      await reply('❌ Gruppenmitglieder konnten gerade nicht geladen werden.');
      return;
    }

    await reply({
      text: [
        `📢 *${metadata?.subject || 'OnimaiBot Tagall'}*`,
        '',
        participantIds.map((jid) => formatMentionTag(jid)).join(' '),
        '',
        '💜 OnimaiBot • WhatsApp only'
      ].join('\n'),
      mentions: participantIds
    });
  }
};
