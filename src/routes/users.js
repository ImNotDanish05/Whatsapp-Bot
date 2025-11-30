const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/userController');
const { isAuthenticated, hasRole } = require('../authMiddleware');

router.get('/', isAuthenticated, hasRole(['admin', 'superadmin']), listUsers);

module.exports = router;
