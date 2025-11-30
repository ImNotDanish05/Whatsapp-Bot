const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../../controllers/settingsController');
const { updateSelectedGroups } = require('../../controllers/groupController');
const { hasRole } = require('../../authMiddleware');

router.route('/')
    .get(getSettings);

router.route('/update')
    .post(hasRole(['admin', 'superadmin']), updateSettings);

// Also allow saving groups via this settings route as requested
router.route('/groups')
    .post(hasRole(['admin', 'superadmin']), updateSelectedGroups);

module.exports = router;
