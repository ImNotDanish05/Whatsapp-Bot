const dayjs = require('dayjs');
const Birthday = require('../models/Birthday');
const Log = require('../models/Log');

// Birthdays per month (by birthDate)
exports.birthdaysPerMonth = async (_req, res) => {
    try {
        const months = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'));
        const counts = Array(12).fill(0);
        const agg = await Birthday.aggregate([
            { $group: { _id: { $month: '$birthDate' }, total: { $sum: 1 } } }
        ]);
        agg.forEach(item => {
            const idx = item._id - 1;
            if (idx >= 0 && idx < 12) counts[idx] = item.total;
        });
        res.json({ status: 'ok', labels: months, data: counts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load stats', error });
    }
};

// Success vs Failed messages
exports.messageStatus = async (_req, res) => {
    try {
        const agg = await Log.aggregate([
            { $group: { _id: '$status', total: { $sum: 1 } } }
        ]);
        let success = 0, failed = 0;
        agg.forEach(item => {
            if (item._id === 'success') success = item.total;
            if (item._id === 'failed') failed = item.total;
        });
        res.json({ status: 'ok', labels: ['Success', 'Failed'], data: [success, failed] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load stats', error });
    }
};

// Daily activity (last 30 days)
exports.dailyActivity = async (_req, res) => {
    try {
        const today = dayjs().startOf('day');
        const from = today.subtract(29, 'day');
        const agg = await Log.aggregate([
            { $match: { sentAt: { $gte: from.toDate(), $lte: today.add(1, 'day').toDate() } } },
            {
                $group: {
                    _id: {
                        y: { $year: '$sentAt' },
                        m: { $month: '$sentAt' },
                        d: { $dayOfMonth: '$sentAt' }
                    },
                    total: { $sum: 1 }
                }
            }
        ]);
        const labels = [];
        const data = [];
        for (let i = 0; i < 30; i++) {
            const day = from.add(i, 'day');
            labels.push(day.format('DD MMM'));
            const match = agg.find(a => a._id.y === day.year() && a._id.m === day.month() + 1 && a._id.d === day.date());
            data.push(match ? match.total : 0);
        }
        res.json({ status: 'ok', labels, data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load stats', error });
    }
};

// Top recipients by phone (top 5)
exports.topRecipients = async (_req, res) => {
    try {
        const agg = await Log.aggregate([
            { $group: { _id: '$phone', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);
        const labels = agg.map(a => a._id || 'Unknown');
        const data = agg.map(a => a.total);
        res.json({ status: 'ok', labels, data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load stats', error });
    }
};

// Last 7 days messages
exports.last7Days = async (_req, res) => {
    try {
        const today = dayjs().startOf('day');
        const from = today.subtract(6, 'day');
        const agg = await Log.aggregate([
            { $match: { sentAt: { $gte: from.toDate(), $lte: today.add(1, 'day').toDate() } } },
            {
                $group: {
                    _id: {
                        y: { $year: '$sentAt' },
                        m: { $month: '$sentAt' },
                        d: { $dayOfMonth: '$sentAt' }
                    },
                    total: { $sum: 1 }
                }
            }
        ]);
        const labels = [];
        const data = [];
        for (let i = 0; i < 7; i++) {
            const day = from.add(i, 'day');
            labels.push(day.format('DD MMM'));
            const match = agg.find(a => a._id.y === day.year() && a._id.m === day.month() + 1 && a._id.d === day.date());
            data.push(match ? match.total : 0);
        }
        res.json({ status: 'ok', labels, data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load stats', error });
    }
};
