const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../../controllers/settingsController');
const { updateSelectedGroups } = require('../../controllers/groupController');

router.route('/')
    .get(getSettings);

router.route('/update')
    .post(updateSettings);

// Also allow saving groups via this settings route as requested
router.route('/groups')
    .post(updateSelectedGroups);

module.exports = router;
