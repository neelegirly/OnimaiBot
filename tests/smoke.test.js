import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

process.env.ONIMAIBOT_DRY_RUN = 'true';
process.env.ONIMAIBASEV3_DRY_RUN = 'true';

const { createOnimaiBaseV3Bot, createOnimaiBot } = await import('../core/OnimaiBaseV3Bot.js');
const { default: menuCommand } = await import('../Onicommands/menu.js');
const { default: demoHelloButton } = await import('../components/buttons/demoHelloButton.js');
const { default: registerCommand } = await import('../Onicommands/register.js');
const { default: meCommand } = await import('../Onicommands/me.js');
const { default: welcomeCommand } = await import('../Onicommands/welcome.js');
const { default: messageReceivedEvent } = await import('../events/messagesUpsert.js');
const { getGroupWelcomeSettings } = await import('../utils/runtimeStore.js');
const { normalizePhoneNumber, sanitizeSessionId } = await import('../utils/multisession.js');

test('lädt Commands, Komponenten und Events im Dry-Run', async () => {
  const bot = await createOnimaiBot({
    ONIMAIBOT_DRY_RUN: 'true',
    LOG_LEVEL: 'error'
  });

  await bot.init();

  assert.equal(typeof createOnimaiBaseV3Bot, 'function');
  assert.equal(bot.client.commands.has('ping'), true);
  assert.equal(bot.client.commands.has('about'), true);
  assert.equal(bot.client.commands.has('menu'), true);
  assert.equal(bot.client.commands.has('plugins'), true);
  assert.equal(bot.client.commands.has('register'), true);
  assert.equal(bot.client.commands.has('me'), true);
  assert.equal(bot.client.commands.has('stats'), true);
  assert.equal(bot.client.commands.has('tagall'), true);
  assert.equal(bot.client.commands.has('welcome'), true);
  assert.equal(bot.client.commands.has('sessions'), true);
  assert.equal(bot.client.commands.has('session-info'), true);
  assert.equal(bot.client.commands.has('session-start'), true);
  assert.equal(bot.client.buttons.size >= 2, true);
  assert.equal(bot.client.menus.size >= 1, true);
  assert.equal(bot.client.events.length >= 5, true);
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
  assert.match(sentPayloads[0], /register/i);
  assert.match(sentPayloads[0], /welcome/i);
  assert.match(sentPayloads[0], /session-start/i);
  assert.equal(sentPayloads[1].buttons.length, 2);
  assert.equal(sentPayloads[2].sections.length, 1);
  assert.equal(rememberedMenu['1'], 'onimaibot:demo:hello');
  assert.equal(rememberedMenu['3'], 'onimaibot:demo:setup');
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
  assert.match(replyPayload, /OnimaiBot/i);
});

test('register und me speichern ein kleines Profil', async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'onimaibot-profile-'));
  let registerReply = '';
  let meReply = '';

  await registerCommand.execute({
    config: { projectRoot },
    rawArgs: 'Neele',
    reply: async (payload) => {
      registerReply = typeof payload === 'string' ? payload : payload?.text || '';
    },
    senderId: '491234567890@s.whatsapp.net',
    senderName: 'Tester'
  });

  await meCommand.execute({
    config: { projectRoot },
    reply: async (payload) => {
      meReply = typeof payload === 'string' ? payload : payload?.text || '';
    },
    senderId: '491234567890@s.whatsapp.net',
    senderName: 'Tester',
    sessionId: 'main-session'
  });

  assert.match(registerReply, /Registrierung erfolgreich/i);
  assert.match(meReply, /Neele/);
  assert.match(meReply, /Registriert/i);
});

test('welcome system reagiert auf Gruppen-Join-Stubs', async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'onimaibot-welcome-'));
  const sentPayloads = [];

  await welcomeCommand.execute({
    args: ['on'],
    chatId: '12345@g.us',
    client: {},
    config: {
      projectRoot,
      whatsapp: { prefix: '!' }
    },
    isOwner: true,
    rawArgs: 'on',
    reply: async () => {},
    senderId: '491234567890@s.whatsapp.net',
    sessionId: 'main-session'
  });

  const settings = await getGroupWelcomeSettings(projectRoot, '12345@g.us');
  assert.equal(settings.welcomeEnabled, true);

  const logger = {
    warn() {},
    error() {},
    child() {
      return this;
    }
  };

  await messageReceivedEvent.execute({
    client: {
      waApi: {
        sendMessage: async (...args) => {
          sentPayloads.push(args);
        },
        getSession: () => ({
          groupMetadata: async () => ({
            subject: 'Testgruppe',
            participants: []
          })
        })
      },
      commands: new Map(),
      commandAliases: new Map(),
      buttons: new Map(),
      menus: new Map(),
      menuSessions: new Map(),
      runtime: {}
    },
    config: {
      projectRoot,
      whatsapp: { prefix: '!' }
    },
    logger
  }, {
    sessionId: 'main-session',
    key: {
      remoteJid: '12345@g.us',
      participant: '491234567890@s.whatsapp.net'
    },
    messageStubType: 27,
    messageStubParameters: ['491234567890@s.whatsapp.net'],
    pushName: 'Tester'
  });

  assert.equal(sentPayloads.length, 1);
  assert.equal(sentPayloads[0][0], 'main-session');
  assert.equal(sentPayloads[0][1], '12345@g.us');
  assert.match(sentPayloads[0][2].text, /Willkommen @491234567890/i);
  assert.deepEqual(sentPayloads[0][2].mentions, ['491234567890@s.whatsapp.net']);
});

test('multisession utils normalisieren session ids und telefonnummern', () => {
  assert.equal(sanitizeSessionId(' Support Session 01 '), 'support-session-01');
  assert.equal(normalizePhoneNumber('+49 123 456-7890'), '491234567890');
});
