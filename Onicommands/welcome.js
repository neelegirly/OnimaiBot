import { getGroupMetadataForSession } from '../utils/multisession.js';
import {
  DEFAULT_WELCOME_TEMPLATE,
  getGroupWelcomeSettings,
  renderWelcomeTemplate,
  updateGroupWelcomeSettings
} from '../utils/runtimeStore.js';
import { isGroupChat } from '../utils/whatsapp.js';

function createHelpText(prefix) {
  return [
    '🌸 *OnimaiBot Welcome-System*',
    `• \`${prefix}welcome show\` → aktuellen Status anzeigen`,
    `• \`${prefix}welcome on\` → Begrüßungen aktivieren`,
    `• \`${prefix}welcome off\` → Begrüßungen deaktivieren`,
    `• \`${prefix}welcome text <vorlage>\` → Text setzen`,
    `• \`${prefix}welcome preview\` → Vorschau senden`,
    `• \`${prefix}welcome reset\` → Standardtext wiederherstellen`,
    '',
    'Platzhalter: `{user}`, `{users}`, `{group}`, `{action}`, `{session}`'
  ].join('\n');
}

export default {
  name: 'welcome',
  aliases: ['welcome-message', 'welcometext'],
  description: 'Verwaltet die WhatsApp-Welcome-Nachricht für Gruppen-Systemmeldungen.',
  async execute({ args, chatId, client, config, isOwner, rawArgs, reply, senderId, sessionId }) {
    if (!isGroupChat(chatId)) {
      await reply('❌ `welcome` funktioniert nur in WhatsApp-Gruppen.');
      return;
    }

    if (!isOwner) {
      await reply('🔒 Welcome-Einstellungen dürfen in dieser Starter-Base nur Owner ändern.');
      return;
    }

    const action = String(args[0] || 'show').trim().toLowerCase();

    if (!action || ['help', '?'].includes(action)) {
      await reply(createHelpText(config.whatsapp.prefix));
      return;
    }

    if (action === 'on') {
      const settings = await updateGroupWelcomeSettings(config.projectRoot, chatId, {
        welcomeEnabled: true
      });
      await reply(`✅ Welcome-Nachrichten sind jetzt *aktiv* für diese Gruppe.\nVorlage: ${settings.welcomeTemplate}`);
      return;
    }

    if (action === 'off') {
      await updateGroupWelcomeSettings(config.projectRoot, chatId, {
        welcomeEnabled: false
      });
      await reply('🛑 Welcome-Nachrichten sind jetzt *deaktiviert* für diese Gruppe.');
      return;
    }

    if (action === 'reset') {
      const settings = await updateGroupWelcomeSettings(config.projectRoot, chatId, {
        welcomeTemplate: DEFAULT_WELCOME_TEMPLATE
      });
      await reply(`♻️ Welcome-Vorlage wurde zurückgesetzt.\n${settings.welcomeTemplate}`);
      return;
    }

    if (action === 'text') {
      const template = String(rawArgs || '').slice(String(args[0] || '').length).trim();

      if (!template) {
        await reply(createHelpText(config.whatsapp.prefix));
        return;
      }

      const settings = await updateGroupWelcomeSettings(config.projectRoot, chatId, {
        welcomeTemplate: template
      });

      await reply([
        '💬 Neue Welcome-Vorlage gespeichert.',
        settings.welcomeTemplate,
        '',
        'Nutze `!welcome preview`, um sie direkt zu testen.'
      ].join('\n'));
      return;
    }

    const settings = await getGroupWelcomeSettings(config.projectRoot, chatId);

    if (action === 'preview') {
      const metadata = await getGroupMetadataForSession(client, sessionId, chatId);
      const previewText = renderWelcomeTemplate(settings.welcomeTemplate, {
        mentionJids: [senderId],
        groupName: metadata?.subject || 'deiner Gruppe',
        action: 'beigetreten',
        sessionId
      });

      await reply({
        text: previewText,
        mentions: [senderId]
      });
      return;
    }

    if (action === 'show' || action === 'status') {
      await reply([
        '🌼 *Welcome-Status*',
        `Aktiv: *${settings.welcomeEnabled ? 'ja' : 'nein'}*`,
        `Vorlage: ${settings.welcomeTemplate}`,
        '',
        'Die Auslösung läuft über WhatsApp-Systemmeldungen bei Gruppenbeitritten.'
      ].join('\n'));
      return;
    }

    await reply(createHelpText(config.whatsapp.prefix));
  }
};
