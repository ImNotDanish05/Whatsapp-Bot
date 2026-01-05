const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getBirthdays,
    addBirthday,
    updateBirthday,
    deleteBirthday,
    exportBirthdaysCSV,
    importBirthdaysCSV,
    deleteAllBirthdays
} = require('../controllers/birthdayController');

// Configure multer for file upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Export route
router.get('/export', exportBirthdaysCSV);

// Import route
router.post('/import', upload.single('file'), importBirthdaysCSV);

// Delete all route
router.delete('/all', deleteAllBirthdays);

router.route('/')
    .get(getBirthdays)
    .post(addBirthday);

router.route('/:id')
    .put(updateBirthday)
    .delete(deleteBirthday);

module.exports = router;
