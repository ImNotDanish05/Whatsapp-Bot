const Log = require('../models/Log');

// @desc    Get all logs
// @route   GET /api/logs
// @access  Public
exports.getLogs = async (req, res) => {
    try {
        const query = {};
        if (req.query.type) query.type = req.query.type;
        const logs = await Log.find(query).sort({ sentAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
