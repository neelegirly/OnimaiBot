import { DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

export default {
  name: 'connection.update',
  async execute({ client, config, logger, services }, update) {
    if (update.qr && config.whatsapp.printQr) {
      logger.info('QR-Code empfangen. Bitte mit WhatsApp scannen.');
      qrcode.generate(update.qr, { small: true });
    }

    if (update.connection === 'open') {
      client.isReady = true;

      logger.info('WhatsApp-Verbindung hergestellt.', {
        user: client.socket?.user?.id || null
      });

      return;
    }

    if (update.connection === 'close') {
      client.isReady = false;

      const statusCode = update.lastDisconnect?.error?.output?.statusCode ?? null;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn('WhatsApp-Verbindung geschlossen.', {
        statusCode,
        shouldReconnect
      });

      if (shouldReconnect) {
        await services.reconnect();
        return;
      }

      logger.warn('Die Session wurde ausgeloggt. Lösche bei Bedarf den Ordner `auth/` und starte neu.');
    }
  }
};
