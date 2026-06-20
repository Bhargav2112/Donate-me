const express = require('express');
const {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { volunteerValidator } = require('../validators/schemaValidators');

const router = express.Router();

// Public endpoint for registration
router.post(
  '/',
  volunteerValidator,
  createVolunteer
);

// Protected endpoints
router.use(protect);

router.get('/', getVolunteers);
router.get('/:id', getVolunteerById);

// Restrict modifications to Super Admin, Admin, Manager, and Volunteer Coordinator
router.put(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Volunteer Coordinator'),
  volunteerValidator,
  updateVolunteer
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Admin', 'Manager', 'Volunteer Coordinator'),
  deleteVolunteer
);

module.exports = router;
