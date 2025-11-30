const express = require('express');
const router = express.Router();
const { searchGroups, updateSelectedGroups } = require('../../controllers/groupController');

router.route('/search').post(searchGroups);
router.route('/select').post(updateSelectedGroups);

module.exports = router;
