const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');

router.route('/').get(getLogs);

module.exports = router;
