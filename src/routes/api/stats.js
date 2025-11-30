const express = require('express');
const router = express.Router();
const {
    birthdaysPerMonth,
    messageStatus,
    dailyActivity,
    topRecipients,
    last7Days
} = require('../../controllers/statsController');

router.get('/birthdays-per-month', birthdaysPerMonth);
router.get('/message-status', messageStatus);
router.get('/daily-activity', dailyActivity);
router.get('/top-recipients', topRecipients);
router.get('/last7days', last7Days);

module.exports = router;
