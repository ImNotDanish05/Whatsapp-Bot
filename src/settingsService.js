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
    sendOnStartupEnabled: false
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

module.exports = {
    getOrCreateSettings,
    formatTemplate,
    normalizeGroupId,
    normalizeGroupEntry,
    DEFAULTS
};
