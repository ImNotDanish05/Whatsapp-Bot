const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const webSocket = require('../websocket');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
    webSocket.broadcast({ type: 'qr', message: 'QR code received. Scan it to log in.' });
});

client.on('ready', () => {
    console.log('Client is ready!');
    webSocket.broadcast({ type: 'ready', message: 'Client is ready.' });
});

client.on('message', msg => {
    webSocket.broadcast({ type: 'incoming', message: `New message from ${msg.from}: ${msg.body}` });
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.destroy();
    client.initialize();
});

client.initialize();

module.exports = client;
