const Settings = require('../models/Settings');
const { getOrCreateSettings, DEFAULTS } = require('../settingsService');

exports.getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.status(200).json({
            status: 'ok',
            data: settings
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch settings', error });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const {
            directMessageEnabled,
            directMessageTemplate,
            groupMessageEnabled,
            selectedGroups,
            groupMessageTemplate,
            statusEnabled,
            statusTemplate,
            sendOnStartupEnabled
        } = req.body;

        const settings = await getOrCreateSettings();

        settings.directMessageEnabled = directMessageEnabled !== undefined ? !!directMessageEnabled : settings.directMessageEnabled;
        settings.directMessageTemplate = directMessageTemplate || DEFAULTS.directMessageTemplate;
        settings.groupMessageEnabled = groupMessageEnabled !== undefined ? !!groupMessageEnabled : settings.groupMessageEnabled;
        if (Array.isArray(selectedGroups)) {
            const { normalizeGroupEntry } = require('../settingsService');
            settings.selectedGroups = selectedGroups
                .map(normalizeGroupEntry)
                .filter(Boolean);
        }
        settings.groupMessageTemplate = groupMessageTemplate || DEFAULTS.groupMessageTemplate;
        settings.statusEnabled = statusEnabled !== undefined ? !!statusEnabled : settings.statusEnabled;
        settings.statusTemplate = statusTemplate || DEFAULTS.statusTemplate;
        settings.sendOnStartupEnabled = sendOnStartupEnabled !== undefined ? !!sendOnStartupEnabled : settings.sendOnStartupEnabled;
        settings.updatedAt = new Date();

        await settings.save();

        res.status(200).json({ status: 'ok', data: settings });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update settings', error });
    }
};
