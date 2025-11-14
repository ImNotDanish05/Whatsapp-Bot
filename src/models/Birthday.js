const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        default: "Happy Birthday!"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Birthday', birthdaySchema);
