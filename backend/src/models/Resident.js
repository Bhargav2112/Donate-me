const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  residentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  photo: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  medicalNotes: { type: String, default: '' },
  guardianDetails: {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true }
  },
  admissionDate: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Discharged', 'Deceased'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
