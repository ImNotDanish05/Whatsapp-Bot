const TestLog = require('../models/TestLog');
const client = require('../bot/index');
const webSocket = require('../websocket');

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
