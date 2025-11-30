function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
}

function hasRole(allowed = []) {
    return (req, res, next) => {
        const user = req.session && req.session.user;
        if (!user) return res.redirect('/login');
        if (user.role === 'superadmin') return next();
        if (allowed.includes(user.role)) return next();
        return res.status(403).send('Forbidden');
    };
}

function attachUser(req, res, next) {
    const user = req.session ? req.session.user : null;
    res.locals.user = user;
    res.locals.role = user ? user.role : null;
    res.locals.hasRole = (allowed = []) => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return allowed.includes(user.role);
    };
    next();
}

module.exports = {
    isAuthenticated,
    hasRole,
    attachUser
};
