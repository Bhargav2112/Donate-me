const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  }],
  gallery: [{ type: String }] // URLs to images
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
