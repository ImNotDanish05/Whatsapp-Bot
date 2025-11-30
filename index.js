require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');

const birthdayRoutes = require('./src/routes/birthdays');
const logRoutes = require('./src/routes/logs');
const indexRoutes = require('./src/routes/index');
const testRoutes = require('./src/routes/test');
const testApiRoutes = require('./src/routes/api/test');
const qrRoutes = require('./src/routes/qr');
const settingsRoutes = require('./src/routes/settings');
const settingsApiRoutes = require('./src/routes/api/settings');
const { runScheduler } = require('./src/bot/scheduler');
const { initQrState } = require('./src/qrService');
const webSocket = require('./src/websocket');
const botClient = require('./src/bot/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

// Ensure QR storage directories/state exist before bot init
initQrState().catch(err => {
    console.error('Failed to initialize QR storage', err);
});

// Routes
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/test', testApiRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/settings', settingsApiRoutes);
app.use('/test', testRoutes);
app.use('/settings', settingsRoutes);
app.use('/', indexRoutes);

// WhatsApp Bot
// (already required as botClient above)

// Cron Job
// Runs every day at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running birthday check...');
    runScheduler();
});

// Optional: run scheduler once on startup if enabled in settings
(async () => {
    try {
        const { getOrCreateSettings } = require('./src/settingsService');
        const settings = await getOrCreateSettings();
        if (settings.sendOnStartupEnabled) {
            console.log('Running birthday check on startup (per settings)... waiting for bot ready');
            await botClient.ready;
            await runScheduler();
        }
    } catch (err) {
        console.error('Failed to run startup scheduler', err);
    }
})();

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

webSocket.init(server);
