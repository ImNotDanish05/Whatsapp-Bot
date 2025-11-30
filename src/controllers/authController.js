const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.showLogin = (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login', error: null, });
};

exports.handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { title: 'Login', error: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', { title: 'Login', error: 'Invalid credentials' });
        }
        req.session.user = { id: user._id.toString(), username: user.username, role: user.role };
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('login', { title: 'Login', error: 'Login failed' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
