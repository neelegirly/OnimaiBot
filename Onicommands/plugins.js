export default {
  name: 'plugins',
  aliases: ['features', 'modules'],
  description: 'Zeigt die geladenen Beispiel-Plugins und Module der Base.',
  async execute({ client, reply }) {
    const commandNames = [...client.commands.keys()].sort();
    const preview = commandNames.slice(0, 10).join(', ');

    await reply([
      '🧩 *OnimaiBot Plugin-Übersicht*',
      `Commands: *${client.commands.size}*`,
      `Buttons: *${client.buttons.size}*`,
      `Menüs: *${client.menus.size}*`,
      `Events: *${client.events.length}*`,
      '',
      `Beispiel-Module: ${preview}${commandNames.length > 10 ? ', ...' : ''}`,
      'Eigene Erweiterungen legst du einfach in `Onicommands/`, `components/` oder `events/` an.'
    ].join('\n'));
  }
};
