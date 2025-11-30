const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    directMessageEnabled: {
        type: Boolean,
        default: true
    },
    directMessageTemplate: {
        type: String,
        default: 'Happy Birthday %name%! Wishing you the best.'
    },
    groupMessageEnabled: {
        type: Boolean,
        default: false
    },
    selectedGroups: {
        type: [String],
        default: []
    },
    groupMessageTemplate: {
        type: String,
        default: 'Everyone say happy birthday to %name%!'
    },
    statusEnabled: {
        type: Boolean,
        default: false
    },
    statusTemplate: {
        type: String,
        default: 'Happy Birthday %name%!'
    },
    sendOnStartupEnabled: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
