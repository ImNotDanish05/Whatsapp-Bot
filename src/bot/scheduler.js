const dayjs = require('dayjs');
const Birthday = require('../models/Birthday');
const Log = require('../models/Log');
const client = require('./index');

async function runScheduler() {
    const today = dayjs();
    const birthdays = await Birthday.find({ isActive: true });

    for (const birthday of birthdays) {
        const birthDate = dayjs(birthday.birthDate);
        if (birthDate.date() === today.date() && birthDate.month() === today.month()) {
            const message = birthday.message || `Happy Birthday ${birthday.name}!`;
            const phone = birthday.phone.startsWith('+') ? `${birthday.phone.substring(1)}@c.us` : `62${birthday.phone.substring(1)}@c.us`;

            try {
                await client.sendMessage(phone, message);
                console.log(`Successfully sent birthday message to ${birthday.name}`);
                await Log.create({
                    phone: birthday.phone,
                    status: 'success',
                    message: message
                });
            } catch (error) {
                console.error(`Failed to send message to ${birthday.name}`, error);
                await Log.create({
                    phone: birthday.phone,
                    status: 'failed',
                    message: message
                });
            }
        }
    }
}

module.exports = { runScheduler };
