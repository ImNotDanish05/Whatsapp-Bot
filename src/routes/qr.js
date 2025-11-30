const express = require('express');
const router = express.Router();
const { getQr } = require('../controllers/qrController');

router.route('/').get(getQr);

module.exports = router;
