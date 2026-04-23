import assert from 'node:assert/strict';
import test from 'node:test';

process.env.ONIMAIBASEV3_DRY_RUN = 'true';

const { createOnimaiBaseV3Bot } = await import('../core/OnimaiBaseV3Bot.js');
const { default: menuCommand } = await import('../Onicommands/menu.js');
const { default: demoHelloButton } = await import('../components/buttons/demoHelloButton.js');

test('lädt Commands, Komponenten und Events im Dry-Run', async () => {
  const bot = await createOnimaiBaseV3Bot({
    ONIMAIBASEV3_DRY_RUN: 'true',
    LOG_LEVEL: 'error'
  });

  await bot.init();

  assert.equal(bot.client.commands.has('ping'), true);
  assert.equal(bot.client.commands.has('menu'), true);
  assert.equal(bot.client.buttons.size >= 2, true);
  assert.equal(bot.client.menus.size >= 1, true);
  assert.equal(bot.client.events.length >= 2, true);
});

test('menu Command baut WhatsApp-Demo und merkt das Fallback-Menü', async () => {
  const sentPayloads = [];
  let rememberedMenu;

  await menuCommand.execute({
    config: {
      whatsapp: {
        prefix: '!'
      }
    },
    logger: {
      warn() {}
    },
    reply: async (payload) => {
      sentPayloads.push(payload);
    },
    rememberMenu: (mapping) => {
      rememberedMenu = mapping;
    }
  });

  assert.equal(sentPayloads.length, 4);
  assert.equal(typeof sentPayloads[0], 'string');
  assert.equal(sentPayloads[1].buttons.length, 2);
  assert.equal(sentPayloads[2].sections.length, 1);
  assert.equal(rememberedMenu['1'], 'onimaibasev3:demo:hello');
  assert.equal(rememberedMenu['3'], 'onimaibasev3:demo:setup');
});

test('demo hello button antwortet einsteigerfreundlich', async () => {
  let replyPayload;

  await demoHelloButton.execute({
    senderName: 'Tester',
    reply: async (payload) => {
      replyPayload = payload;
    }
  });

  assert.ok(replyPayload);
  assert.match(replyPayload, /Hallo .*Tester/i);
});
