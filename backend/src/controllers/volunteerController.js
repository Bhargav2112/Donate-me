const Volunteer = require('../models/Volunteer');

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createVolunteer = async (req, res) => {
  try {
    const { volunteerId, fullName, mobile, email, address, skills, interests, totalHours } = req.body;

    const existingVolunteer = await Volunteer.findOne({
      $or: [{ volunteerId }, { email }]
    });
    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer with this Volunteer ID or Email already exists'
      });
    }

    const newVolunteer = await Volunteer.create({
      volunteerId,
      fullName,
      mobile,
      email,
      address: address || '',
      skills: skills || [],
      interests: interests || [],
      totalHours: Number(totalHours) || 0
    });

    req.logAction = `Registered volunteer: ${newVolunteer.fullName}`;
    req.logDetails = { volunteerId: newVolunteer._id, volunteerCustomId: newVolunteer.volunteerId };

    res.status(201).json({ success: true, data: newVolunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const { volunteerId, fullName, mobile, email, address, skills, interests, totalHours } = req.body;

    if (volunteerId || email) {
      const query = [];
      if (volunteerId && volunteerId !== volunteer.volunteerId) query.push({ volunteerId });
      if (email && email !== volunteer.email) query.push({ email });

      if (query.length > 0) {
        const duplicate = await Volunteer.findOne({ $or: query });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: 'Another volunteer with this Volunteer ID or Email already exists'
          });
        }
      }
    }

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      {
        volunteerId: volunteerId || volunteer.volunteerId,
        fullName: fullName || volunteer.fullName,
        mobile: mobile || volunteer.mobile,
        email: email || volunteer.email,
        address: address !== undefined ? address : volunteer.address,
        skills: skills || volunteer.skills,
        interests: interests || volunteer.interests,
        totalHours: totalHours !== undefined ? Number(totalHours) : volunteer.totalHours
      },
      { new: true, runValidators: true }
    );

    req.logAction = `Updated volunteer: ${updatedVolunteer.fullName}`;
    req.logDetails = { volunteerId: updatedVolunteer._id, volunteerCustomId: updatedVolunteer.volunteerId };

    res.status(200).json({ success: true, data: updatedVolunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    await Volunteer.findByIdAndDelete(req.params.id);

    req.logAction = `Deleted volunteer: ${volunteer.fullName}`;
    req.logDetails = { volunteerId: volunteer._id, volunteerCustomId: volunteer.volunteerId };

    res.status(200).json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
};
