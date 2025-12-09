const Event = require('../models/Event');

// List events with optional pagination
exports.listEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const query = {};

        if (req.query.active === 'true') query.isActive = true;
        if (req.query.active === 'false') query.isActive = false;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.status(200).json({ total, page, limit, events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const payload = req.body;
        // Normalize recipients: allow comma separated string
        if (typeof payload.recipients === 'string') {
            payload.recipients = payload.recipients.split(',').map(r => r.trim()).filter(Boolean);
        }
        // Parse eventDate if provided as YYYY-MM-DD string
        if (payload.eventDate && typeof payload.eventDate === 'string') {
            payload.eventDate = new Date(payload.eventDate);
        }
        const event = new Event(payload);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        if (typeof payload.recipients === 'string') {
            payload.recipients = payload.recipients.split(',').map(r => r.trim()).filter(Boolean);
        }
        if (payload.eventDate && typeof payload.eventDate === 'string') {
            payload.eventDate = new Date(payload.eventDate);
        }
        const updated = await Event.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
