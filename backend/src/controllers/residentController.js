const Resident = require('../models/Resident');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: residents.length, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }
    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createResident = async (req, res) => {
  try {
    const { residentId, name, age, gender, medicalNotes, guardianDetails, admissionDate, status } = req.body;

    const existingResident = await Resident.findOne({ residentId });
    if (existingResident) {
      return res.status(400).json({
        success: false,
        message: 'Resident with this Resident ID already exists'
      });
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'residents');
    }

    // Since express-validator check might parse guardianDetails as object or string if sent as multi-part form data
    let parsedGuardianDetails = guardianDetails;
    if (typeof guardianDetails === 'string') {
      try {
        parsedGuardianDetails = JSON.parse(guardianDetails);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid guardianDetails JSON format' });
      }
    }

    const newResident = await Resident.create({
      residentId,
      photo: photoUrl,
      name,
      age: Number(age),
      gender,
      medicalNotes: medicalNotes || '',
      guardianDetails: parsedGuardianDetails,
      admissionDate,
      status: status || 'Active'
    });

    req.logAction = `Created resident entry: ${newResident.name}`;
    req.logDetails = { residentId: newResident._id, residentCustomId: newResident.residentId };

    res.status(201).json({ success: true, data: newResident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    const { residentId, name, age, gender, medicalNotes, guardianDetails, admissionDate, status } = req.body;

    if (residentId && residentId !== resident.residentId) {
      const duplicate = await Resident.findOne({ residentId });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another resident with this Resident ID already exists'
        });
      }
    }

    let photoUrl = resident.photo;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.path, 'residents');
    }

    let parsedGuardianDetails = guardianDetails;
    if (typeof guardianDetails === 'string') {
      try {
        parsedGuardianDetails = JSON.parse(guardianDetails);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid guardianDetails JSON format' });
      }
    }

    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      {
        residentId: residentId || resident.residentId,
        photo: photoUrl,
        name: name || resident.name,
        age: age ? Number(age) : resident.age,
        gender: gender || resident.gender,
        medicalNotes: medicalNotes !== undefined ? medicalNotes : resident.medicalNotes,
        guardianDetails: parsedGuardianDetails || resident.guardianDetails,
        admissionDate: admissionDate || resident.admissionDate,
        status: status || resident.status
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated resident entry: ${updatedResident.name}`;
    req.logDetails = { residentId: updatedResident._id, residentCustomId: updatedResident.residentId };

    res.status(200).json({ success: true, data: updatedResident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    await Resident.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted resident entry: ${resident.name}`;
    req.logDetails = { residentId: resident._id, residentCustomId: resident.residentId };

    res.status(200).json({ success: true, message: 'Resident deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident
};
