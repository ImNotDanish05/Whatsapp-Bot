const TestLog = require('../models/TestLog');
const client = require('../bot/index');
const webSocket = require('../websocket');
const Event = require('../models/Event');
const { renderEventMessage } = require('../settingsService');

// @desc    Send a test message
// @route   POST /api/test/send
// @access  Public
exports.sendTestMessage = async (req, res) => {
    try {
        let { phone, message } = req.body;

        if (!phone.startsWith('62')) {
            phone = '62' + phone.substring(1);
        }
        phone = `${phone}@c.us`;

        const response = await client.sendMessage(phone, message);
        webSocket.broadcast({ type: 'sent', message: `To: ${phone}, Msg: ${message}` });

        const newLog = new TestLog({
            phone: req.body.phone,
            message,
            response: response.body,
            status: 'success',
            type: 'manual'
        });
        await newLog.save();

        res.status(200).json({ message: 'Test message sent successfully' });
    } catch (error) {
        console.error(error);
        webSocket.broadcast({ type: 'sent', message: `Failed to send message: ${error.message}` });
        const newLog = new TestLog({
            phone: req.body.phone,
            message: req.body.message,
            response: error.message,
            status: 'failed',
            type: 'manual'
        });
        await newLog.save();
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Ping the bot
// @route   POST /api/test/ping
// @access  Public
exports.pingBot = async (req, res) => {
    try {
        await client.pupPage.evaluate('window.WPP.conn.checkUpdate()');
        webSocket.broadcast({ type: 'sent', message: 'Ping sent' });

        const newLog = new TestLog({
            message: 'Ping',
            response: 'Pong',
            status: 'success',
            type: 'ping'
        });
        await newLog.save();

        res.status(200).json({ message: 'Ping successful' });
    } catch (error) {
        console.error(error);
        webSocket.broadcast({ type: 'sent', message: `Ping failed: ${error.message}` });
        const newLog = new TestLog({
            message: 'Ping',
            response: error.message,
            status: 'failed',
            type: 'ping'
        });
        await newLog.save();
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all test logs
// @route   GET /api/test/logs
// @access  Public
exports.getTestLogs = async (req, res) => {
    try {
        const logs = await TestLog.find().sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Simulate daily cron
// @route   POST /api/test/cron
// @access  Public
exports.simulateCron = async (req, res) => {
    try {
        const { runScheduler } = require('../bot/scheduler');
        runScheduler();
        webSocket.broadcast({ type: 'sent', message: 'Simulating daily cron job' });
        res.status(200).json({ message: 'Cron job simulated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Manual send of a specific event by id
exports.sendEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        if (!eventId) return res.status(400).json({ message: 'eventId is required' });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        let recipients = [];
        if (Array.isArray(event.recipients) && event.recipients.length) {
            recipients = event.recipients.map(p => ({ phone: p, name: '' }));
        } else {
            const birthdays = await require('../models/Birthday').find({ isActive: true });
            recipients = birthdays.map(b => ({ phone: b.phone, name: b.name }));
        }

        const results = [];
        for (const r of recipients) {
            const message = renderEventMessage(event.message, r, event);
            let phone = r.phone;
            if (!phone.startsWith('62')) {
                if (phone.startsWith('+')) phone = phone.substring(1);
                else if (phone.startsWith('0')) phone = '62' + phone.substring(1);
            }
            const phoneJid = `${phone}@c.us`;
            try {
                const response = await client.sendMessage(phoneJid, message);
                const newLog = new TestLog({ phone: r.phone, message, response: response.body || '', status: 'success', type: 'event-manual' });
                await newLog.save();
                results.push({ phone: r.phone, status: 'success' });
                webSocket.broadcast({ type: 'sent', message: `Event sent to ${phoneJid}` });
            } catch (error) {
                const newLog = new TestLog({ phone: r.phone, message, response: error.message || '', status: 'failed', type: 'event-manual' });
                await newLog.save();
                results.push({ phone: r.phone, status: 'failed', error: error.message });
                webSocket.broadcast({ type: 'sent', message: `Failed to send event to ${r.phone}` });
            }
        }

        res.status(200).json({ message: 'Event send simulated', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Simulate daily event cron specifically
exports.simulateEventCron = async (req, res) => {
    try {
        const { runScheduler } = require('../bot/scheduler');
        await runScheduler();
        webSocket.broadcast({ type: 'sent', message: 'Simulating event cron job' });
        res.status(200).json({ message: 'Event cron simulated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
