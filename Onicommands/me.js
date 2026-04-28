import { getOrCreateUserProfile } from '../utils/runtimeStore.js';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('de-DE');
}

export default {
  name: 'me',
  aliases: ['profil', 'profile'],
  description: 'Zeigt dein gespeichertes OnimaiBot-Profil an.',
  async execute({ config, reply, senderId, senderName, sessionId }) {
    const profile = await getOrCreateUserProfile(config.projectRoot, {
      senderId,
      displayName: senderName
    });

    await reply([
      '👤 *Dein OnimaiBot Profil*',
      `Name: *${profile.registeredName || profile.name || senderName || 'Freund'}*`,
      `Status: *${profile.registered ? 'Registriert' : 'Noch nicht registriert'}*`,
      `Level: *${profile.level}*`,
      `XP: *${profile.xp}*`,
      `Commands genutzt: *${profile.commandCount}*`,
      `Session: *${sessionId}*`,
      `Erstellt: *${formatDate(profile.createdAt)}*`,
      `Zuletzt gesehen: *${formatDate(profile.lastSeenAt)}*`,
      profile.registeredAt ? `Registriert seit: *${formatDate(profile.registeredAt)}*` : 'Tipp: Nutze `!register <Name>` für einen festen Profilnamen.'
    ].join('\n'));
  }
};
