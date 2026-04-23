export const DEMO_COMPONENT_IDS = {
  hello: 'onimaibasev3:demo:hello',
  details: 'onimaibasev3:demo:details',
  setup: 'onimaibasev3:demo:setup'
};

export function createDemoMenuMessages(prefix) {
  return {
    introText: [
      '🌸 *OnimaiBaseV3 Multi-Session Menü*',
      '',
      `Basisbefehle: *${prefix}ping*, *${prefix}menu*, *${prefix}sessions*`,
      `Lifecycle: *${prefix}session-start <id>* oder *${prefix}session-pair <id> <nummer>*`,
      'Du bekommst unten zwei Buttons, ein kleines Menü und weiter einen simplen Fallback.'
    ].join('\n'),
    buttonMessage: {
      text: '*OnimaiBaseV3 Schnellaktionen*',
      footer: 'OnimaiBaseV3 • wa-api Multi-Session Base',
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
      footer: 'OnimaiBaseV3 • wa-api Multi-Session Base',
      title: 'OnimaiBaseV3 Multi-Session Menü',
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
