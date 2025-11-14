const express = require('express');
const router = express.Router();
const Birthday = require('../models/Birthday');
const Log = require('../models/Log');
const dayjs = require('dayjs');

// Home page
router.get('/', async (req, res) => {
    try {
        const totalBirthdays = await Birthday.countDocuments({ isActive: true });
        res.render('home', {
            title: 'Dashboard',
            totalBirthdays
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Birthdays page
router.get('/birthdays', async (req, res) => {
    try {
        const birthdays = await Birthday.find().sort({ createdAt: -1 });
        res.render('birthdays', {
            title: 'Birthdays',
            birthdays,
            dayjs
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Logs page
router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ sentAt: -1 });
        res.render('logs', {
            title: 'Logs',
            logs,
            dayjs
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
