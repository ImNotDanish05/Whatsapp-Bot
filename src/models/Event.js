const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    eventDate: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        default: 'Today is %name%\'s special day!'
    },
    recipients: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
