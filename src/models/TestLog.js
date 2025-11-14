const mongoose = require('mongoose');

const testLogSchema = new mongoose.Schema({
    phone: String,
    message: String,
    response: String,          // WhatsApp API response text
    status: String,            // "success" | "failed"
    type: String,              // "manual", "auto-cron", "ping", "incoming"
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TestLog', testLogSchema);
