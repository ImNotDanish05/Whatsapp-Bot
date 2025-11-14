const express = require('express');
const router = express.Router();
const {
    sendTestMessage,
    pingBot,
    getTestLogs,
    simulateCron
} = require('../../controllers/testController');

router.route('/send')
    .post(sendTestMessage);

router.route('/ping')
    .post(pingBot);

router.route('/logs')
    .get(getTestLogs);

router.route('/cron')
    .post(simulateCron);

module.exports = router;
