const dayjs = require('dayjs');
const Birthday = require('../models/Birthday');
const Log = require('../models/Log');
const client = require('./index');
const { getOrCreateSettings, formatTemplate, normalizeGroupId } = require('../settingsService');

function formatPhoneJid(phone) {
    if (!phone) return null;
    if (phone.includes('@c.us')) return phone;
    if (phone.startsWith('+')) return `${phone.substring(1)}@c.us`;
    if (phone.startsWith('62')) return `${phone}@c.us`;
    return `62${phone.substring(1)}@c.us`;
}

async function sendAndLog(target, message, meta = {}) {
    try {
        await client.sendMessage(target, message);
        await Log.create({
            phone: target,
            status: 'success',
            message
        });
        return true;
    } catch (error) {
        await Log.create({
            phone: target,
            status: 'failed',
            message
        });
        console.error(`Failed to send message to ${target}`, error);
        return false;
    }
}

async function runScheduler() {
    const today = dayjs();
    const birthdays = await Birthday.find({ isActive: true });
    const settings = await getOrCreateSettings();

    for (const birthday of birthdays) {
        const birthDate = dayjs(birthday.birthDate);
        if (birthDate.date() !== today.date() || birthDate.month() !== today.month()) continue;

        // Direct message
        if (settings.directMessageEnabled) {
            const message = formatTemplate(settings.directMessageTemplate, birthday);
            const phoneJid = formatPhoneJid(birthday.phone);
            if (phoneJid) {
                await sendAndLog(phoneJid, message);
            }
        }

        // Group messages
        if (settings.groupMessageEnabled && Array.isArray(settings.selectedGroups)) {
            const groupMessage = formatTemplate(settings.groupMessageTemplate, birthday);
            for (const g of settings.selectedGroups) {
                const gid = normalizeGroupId(g);
                if (!gid) continue;
                await sendAndLog(gid, groupMessage);
            }
        }

        // Status update
        if (settings.statusEnabled) {
            const statusMessage = formatTemplate(settings.statusTemplate, birthday);
            await sendAndLog('status@broadcast', statusMessage);
        }
    }
}

module.exports = { runScheduler };
