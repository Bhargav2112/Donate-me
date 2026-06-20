const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('volunteers', 'fullName email mobile volunteerId')
      .sort({ date: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('volunteers', 'fullName email mobile volunteerId');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const newEvent = await Event.create({
      title,
      description: description || '',
      date,
      location,
      volunteers: [],
      gallery: []
    });

    req.logAction = `Created event: ${newEvent.title}`;
    req.logDetails = { eventId: newEvent._id };

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { title, description, date, location } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title || event.title,
        description: description !== undefined ? description : event.description,
        date: date || event.date,
        location: location || event.location
      },
      { new: true, runValidators: true }
    ).populate('volunteers', 'fullName email mobile');

    req.logAction = `Updated event: ${updatedEvent.title}`;
    req.logDetails = { eventId: updatedEvent._id };

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted event: ${event.title}`;
    req.logDetails = { eventId: event._id };

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/volunteers (register volunteer to event)
const registerVolunteerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { volunteerId } = req.body; // MongoDB ObjectId of volunteer
    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Volunteer ID is required' });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Check if volunteer is already registered
    if (event.volunteers.includes(volunteerId)) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already registered for this event'
      });
    }

    event.volunteers.push(volunteerId);
    await event.save();

    req.logAction = `Registered volunteer ${volunteer.fullName} to event: ${event.title}`;
    req.logDetails = { eventId: event._id, volunteerId };

    const populatedEvent = await event.populate('volunteers', 'fullName email mobile');

    res.status(200).json({ success: true, data: populatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events/:id/gallery (upload photo to event gallery)
const uploadToEventGallery = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const photoUrl = await uploadToCloudinary(req.file.path, 'events');
    event.gallery.push(photoUrl);
    await event.save();

    req.logAction = `Uploaded image to event gallery: ${event.title}`;
    req.logDetails = { eventId: event._id, photoUrl };

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerVolunteerForEvent,
  uploadToEventGallery
};
