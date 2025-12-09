const dayjs = require('dayjs');
const Settings = require('./models/Settings');

const DEFAULTS = {
    directMessageEnabled: true,
    directMessageTemplate: 'Happy Birthday %name%! Wishing you the best.',
    groupMessageEnabled: false,
    selectedGroups: [],
    groupMessageTemplate: 'Everyone say happy birthday to %name%!',
    statusEnabled: false,
    statusTemplate: 'Happy Birthday %name%!',
    sendOnStartupEnabled: false,
    aiApiToken: '',
    aiModelName: 'gemini-2.5-pro'
};

async function getOrCreateSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings(DEFAULTS);
        await settings.save();
    }
    return settings;
}

function formatTemplate(template, birthday) {
    if (!template) return '';
    const today = dayjs();
    const birthDate = dayjs(birthday.birthDate);
    const age = today.diff(birthDate, 'year');
    const formattedDate = birthDate.format('YYYY-MM-DD');

    return template
        .replace(/%name%/g, birthday.name || '')
        .replace(/%age%/g, age.toString())
        .replace(/%birthdate%/g, formattedDate);
}

function renderEventMessage(template, recipient, event) {
    if (!template) return '';
    const today = dayjs();
    const ed = event.eventDate ? dayjs(event.eventDate) : null;

    const age = ed ? (today.year() - ed.year()) : '';

    const birthday = ed ? ed.format('DD MMM YYYY') : '';
    const born = ed ? ed.format('DD/MM/YYYY') : '';

    const name = (recipient && typeof recipient === 'object') ? (recipient.name || '') : (recipient || '');

    return template
        .replace(/%name%/g, name || '')
        .replace(/%age%/g, age !== '' ? String(age) : '')
        .replace(/%birthday%/g, birthday)
        .replace(/%born%/g, born);
}

function normalizeGroupId(groupId) {
    if (!groupId) return null;
    const trimmed = groupId.trim();
    if (!trimmed) return null;
    if (trimmed.endsWith('@g.us')) return trimmed;
    return `${trimmed}@g.us`;
}

function normalizeGroupEntry(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') {
        return { name: entry, id: normalizeGroupId(entry) };
    }
    const name = entry.name || '';
    const id = normalizeGroupId(entry.id || entry.groupId || entry.group_id || name);
    if (!id) return null;
    return { name, id };
}

function renderTemplate(template, recipient, eventOrBirthday) {
    if (!template) return '';

    // For now, just return a basic template replacement
    // This could be expanded to handle more complex replacements
    return template
        .replace(/%name%/g, recipient.name || '')
        .replace(/%age%/g, eventOrBirthday.age ? eventOrBirthday.age.toString() : '')
        .replace(/%birthday%/g, eventOrBirthday.birthday || '')
        .replace(/%born%/g, eventOrBirthday.born || '');
}

module.exports = {
    getOrCreateSettings,
    formatTemplate,
    normalizeGroupId,
    normalizeGroupEntry,
    renderEventMessage,
    renderTemplate,
    DEFAULTS
};
