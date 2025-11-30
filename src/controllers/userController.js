const bcrypt = require('bcrypt');
const User = require('../models/User');

const editableRoles = ['admin', 'operator', 'viewer', 'auditor'];

exports.listUsers = async (req, res) => {
    const users = await User.find({}).lean();
    res.render('users', { title: 'User Management', users });
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!editableRoles.includes(role)) {
            return res.status(400).json({ status: 'error', message: 'Invalid role' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashed, role });
        res.status(201).json({ status: 'ok', user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to create user', error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ status: 'error', message: 'Cannot edit superadmin' });
        if (!editableRoles.includes(role)) return res.status(400).json({ status: 'error', message: 'Invalid role' });
        user.username = username || user.username;
        user.role = role;
        await user.save();
        res.status(200).json({ status: 'ok', user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update user', error });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ status: 'error', message: 'Cannot edit superadmin' });
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update password', error });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        if (user.role === 'superadmin') return res.status(403).json({ status: 'error', message: 'Cannot delete superadmin' });
        await user.deleteOne();
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete user', error });
    }
};
