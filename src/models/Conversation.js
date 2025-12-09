const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    language: {
        type: String,
        default: 'id'
    },
    optedIn: {
        type: Boolean,
        default: false
    },
    aiMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);