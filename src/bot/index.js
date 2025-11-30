const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const webSocket = require('../websocket');
const { saveQrString, markAuthenticated } = require('../qrService');

let readyResolve;
const ready = new Promise(resolve => {
    readyResolve = resolve;
});

const client = new Client({
    authStrategy: new LocalAuth(),
    // Disable local web cache to avoid crashing when manifest pattern changes upstream.
    webVersionCache: {
        type: 'none'
    },
    puppeteer: {
    headless: true,
    executablePath: process.env.CHROME_EXECUTABLE_PATH,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
    ]
}
});

client.on('error', (err) => {
    console.error('CLIENT ERROR', err);
});

client.on('qr', async (qr) => {
    // Keep terminal output so you can confirm the QR is emitted.a
    console.log('QR RECEIVED (string):', qr);
    qrcode.generate(qr, { small: true });
    try {
        await saveQrString(qr);
        console.log('QR PNG saved to /storage/qr/qr.png (served from src/public/storage/qr/qr.png)');
    } catch (err) {
        console.error('Failed to persist QR string/PNG', err);
    }
    webSocket.broadcast({ type: 'qr', message: 'QR code received. Scan it to log in.', qr });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    try {
        await markAuthenticated('ready');
    } catch (err) {
        console.error('Failed to mark authenticated state', err);
    }
    webSocket.broadcast({ type: 'ready', message: 'Client is ready.' });
    if (readyResolve) readyResolve();
});

client.on('authenticated', async (session) => {
    try {
        await markAuthenticated(session);
    } catch (err) {
        console.error('Failed to mark authenticated session', err);
    }
});

client.on('message', msg => {
    webSocket.broadcast({ type: 'incoming', message: `New message from ${msg.from}: ${msg.body}` });
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('change_state', state => {
    console.log('CLIENT STATE CHANGED', state);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.destroy();
    client.initialize();
});

console.log('Initializing WhatsApp client...');
client.initialize().catch(err => {
    console.error('Failed to initialize WhatsApp client', err);
});

module.exports = client;
module.exports.ready = ready;
