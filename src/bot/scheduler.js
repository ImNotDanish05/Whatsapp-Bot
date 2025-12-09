const dayjs = require('dayjs');
const Birthday = require('../models/Birthday');
const Event = require('../models/Event');
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
            message,
            type: meta.type || null
        });
        return true;
    } catch (error) {
        await Log.create({
            phone: target,
            status: 'failed',
            message: error.message || String(error),
            type: meta.type || null
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
                await sendAndLog(phoneJid, message, { type: 'birthday' });
            }
        }

        // Group messages
        if (settings.groupMessageEnabled && Array.isArray(settings.selectedGroups)) {
            const groupMessage = formatTemplate(settings.groupMessageTemplate, birthday);
            for (const g of settings.selectedGroups) {
                const gid = normalizeGroupId(g.id || g);
                if (!gid) continue;
                await sendAndLog(gid, groupMessage);
            }
        }

        // Status update
        if (settings.statusEnabled) {
            const statusMessage = formatTemplate(settings.statusTemplate, birthday);
            await sendAndLog('status@broadcast', statusMessage, { type: 'birthday' });
        }
    }

    // Events processing
    const events = await Event.find({ isActive: true });
    for (const event of events) {
        const ed = dayjs(event.eventDate);
        if (ed.date() !== today.date() || ed.month() !== today.month()) continue;

        // Determine recipients: event.recipients if provided, else all birthday contacts
        let recipients = [];
        if (Array.isArray(event.recipients) && event.recipients.length) {
            recipients = event.recipients.map(r => ({
                phone: r,
                name: event.name  // THIS FIXES %name%
            }));
        } else {
            const allBirthdays = await Birthday.find({ isActive: true });
            recipients = allBirthdays.map(b => ({ phone: b.phone, name: b.name }));
        }

        for (const r of recipients) {
            const message = require('../settingsService').renderEventMessage(event.message, r, event);
            const phoneJid = formatPhoneJid(r.phone);
            if (!phoneJid) continue;
            try {
                await client.sendMessage(phoneJid, message);
                await Log.create({ phone: phoneJid, status: 'success', message, type: 'event' });
            } catch (error) {
                await Log.create({ phone: phoneJid, status: 'failed', message: error.message || String(error), type: 'event' });
                console.error(`Failed to send event message to ${phoneJid}`, error);
            }
        }
        // Group messages for events
        if (settings.groupMessageEnabled && Array.isArray(settings.selectedGroups)) {
            const groupEventMessage = require('../settingsService')
                .renderEventMessage(event.message, { 
                    name: event.name, 
                    phone: '' 
                }, event);

            for (const g of settings.selectedGroups) {
                const gid = normalizeGroupId(g.id || g);
                if (!gid) continue;

                await sendAndLog(gid, groupEventMessage, { type: 'event' });
            }
        }

    }
}

module.exports = { runScheduler };
