const Birthday = require('../models/Birthday');

// @desc    Get all birthdays
// @route   GET /api/birthdays
// @access  Public
exports.getBirthdays = async (req, res) => {
    try {
        const birthdays = await Birthday.find();
        res.status(200).json(birthdays);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Add a new birthday
// @route   POST /api/birthdays
// @access  Public
exports.addBirthday = async (req, res) => {
    try {
        const { name, phone, birthDate, message } = req.body;
        const newBirthday = new Birthday({
            name,
            phone,
            birthDate,
            message
        });
        const savedBirthday = await newBirthday.save();
        res.status(201).json(savedBirthday);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update a birthday
// @route   PUT /api/birthdays/:id
// @access  Public
exports.updateBirthday = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBirthday = await Birthday.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBirthday) {
            return res.status(404).json({ message: 'Birthday not found' });
        }
        res.status(200).json(updatedBirthday);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a birthday
// @route   DELETE /api/birthdays/:id
// @access  Public
exports.deleteBirthday = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBirthday = await Birthday.findByIdAndDelete(id);
        if (!deletedBirthday) {
            return res.status(404).json({ message: 'Birthday not found' });
        }
        res.status(200).json({ message: 'Birthday deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
