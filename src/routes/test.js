const express = require('express');
const router = express.Router();

// For now, just render a simple page.
// I will create controllers later.

router.get('/', (req, res) => {
    res.render('test', { title: 'Test Bot' });
});

router.get('/reports', (req, res) => {
    res.render('test_reports', { title: 'Test Reports' });
});

module.exports = router;
