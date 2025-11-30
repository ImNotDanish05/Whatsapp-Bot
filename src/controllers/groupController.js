const bot = require('../bot/index');
const client = bot;
const { normalizeGroupEntry, getOrCreateSettings } = require('../settingsService');

exports.searchGroups = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ status: 'error', message: 'Name is required' });
        }
        if (bot.ready) {
            await bot.ready;
        }
        const chats = await client.getChats();
        const target = name.trim().toLowerCase();
        const matches = chats
            .filter(c => c.isGroup && c.name && c.name.toLowerCase() === target)
            .map(c => ({ name: c.name, id: c.id._serialized }));

        res.status(200).json({ status: 'ok', data: matches });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to search groups', error });
    }
};

exports.updateSelectedGroups = async (req, res) => {
    try {
        const { selectedGroups } = req.body;
        if (!Array.isArray(selectedGroups)) {
            return res.status(400).json({ status: 'error', message: 'selectedGroups must be an array' });
        }
        const normalized = selectedGroups.map(normalizeGroupEntry).filter(Boolean);
        const settings = await getOrCreateSettings();
        settings.selectedGroups = normalized;
        settings.updatedAt = new Date();
        await settings.save();
        res.status(200).json({ status: 'ok', data: settings.selectedGroups });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update selected groups', error });
    }
};
