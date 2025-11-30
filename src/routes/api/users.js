const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, updatePassword } = require('../../controllers/userController');
const { isAuthenticated, hasRole } = require('../../authMiddleware');

router.use(isAuthenticated, hasRole(['admin', 'superadmin']));

router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);

module.exports = router;
