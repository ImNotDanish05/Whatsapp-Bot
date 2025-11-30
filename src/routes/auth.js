const express = require('express');
const router = express.Router();
const { showLogin, handleLogin, logout } = require('../controllers/authController');

router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/logout', logout);

module.exports = router;
