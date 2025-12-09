const express = require('express');
const router = express.Router();
const {
    listEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent
} = require('../controllers/eventController');

router.route('/')
    .get(listEvents)
    .post(createEvent);

router.route('/:id')
    .get(getEvent)
    .put(updateEvent)
    .delete(deleteEvent);

module.exports = router;
