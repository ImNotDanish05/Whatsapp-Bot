const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../../controllers/settingsController');

router.route('/')
    .get(getSettings);

router.route('/update')
    .post(updateSettings);

module.exports = router;
