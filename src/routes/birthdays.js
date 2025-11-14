const express = require('express');
const router = express.Router();
const {
    getBirthdays,
    addBirthday,
    updateBirthday,
    deleteBirthday
} = require('../controllers/birthdayController');

router.route('/')
    .get(getBirthdays)
    .post(addBirthday);

router.route('/:id')
    .put(updateBirthday)
    .delete(deleteBirthday);

module.exports = router;
