const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Log', logSchema);
