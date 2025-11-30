const bcrypt = require('bcrypt');
const User = require('./models/User');

async function bootstrapSuperAdmin() {
    const username = process.env.SUPERADMIN_USERNAME;
    const password = process.env.SUPERADMIN_PASSWORD;
    if (!username || !password) {
        console.warn('Super admin credentials not set in .env (SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD)');
        return;
    }

    const existing = await User.findOne({ role: 'superadmin' });
    const hashed = await bcrypt.hash(password, 10);

    if (!existing) {
        await User.create({ username, password: hashed, role: 'superadmin' });
        console.log('Super admin created/bootstrapped');
    } else {
        existing.username = username;
        existing.password = hashed;
        await existing.save();
        console.log('Super admin synced from .env');
    }
}

module.exports = {
    bootstrapSuperAdmin
};
