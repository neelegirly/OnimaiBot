export const DEMO_COMPONENT_IDS = {
  hello: 'onimaibot:demo:hello',
  details: 'onimaibot:demo:details',
  setup: 'onimaibot:demo:setup'
};

export function createDemoMenuMessages(prefix) {
  return {
    introText: [
      '🌸 *OnimaiBot Multi-Session Menü*',
      '',
      `Basisbefehle: *${prefix}ping*, *${prefix}about*, *${prefix}stats*, *${prefix}plugins*`,
      `Profile: *${prefix}register <Name>* und *${prefix}me*`,
      `Gruppen: *${prefix}tagall* und *${prefix}welcome preview*`,
      `Lifecycle: *${prefix}session-start <id>* oder *${prefix}session-pair <id> <nummer>*`,
      'Du bekommst unten zwei Buttons, ein kleines Menü und weiter einen simplen Fallback.'
    ].join('\n'),
    buttonMessage: {
      text: '*OnimaiBot Schnellaktionen*',
      footer: 'OnimaiBot • wa-api Multi-Session Base',
      buttons: [
        {
          buttonId: DEMO_COMPONENT_IDS.hello,
          buttonText: { displayText: 'Hallo' },
          type: 1
        },
        {
          buttonId: DEMO_COMPONENT_IDS.details,
          buttonText: { displayText: 'Details' },
          type: 1
        }
      ],
      headerType: 1
    },
    listMessage: {
      text: 'Öffne das Mini-Menü für kurze Infos zur Multi-Session-Base.',
      footer: 'OnimaiBot • wa-api Multi-Session Base',
      title: 'OnimaiBot Multi-Session Menü',
      buttonText: 'Menü öffnen',
      sections: [
        {
          title: 'Einsteigerhilfe',
          rows: [
            {
              title: 'Setup & Struktur',
              description: 'Zeigt Aufbau, PM2 und wa-api Lifecycle-Hinweise',
              rowId: DEMO_COMPONENT_IDS.setup
            }
          ]
        }
      ]
    },
    fallbackText: [
      '*Fallback-Menü*',
      '1) Hallo',
      '2) Details',
      '3) Setup & Struktur',
      '',
      'Wenn dein Client keine nativen Buttons/Liste zeigt, antworte einfach mit *1*, *2* oder *3*.'
    ].join('\n'),
    fallbackMap: {
      '1': DEMO_COMPONENT_IDS.hello,
      '2': DEMO_COMPONENT_IDS.details,
      '3': DEMO_COMPONENT_IDS.setup
    }
  };
}
