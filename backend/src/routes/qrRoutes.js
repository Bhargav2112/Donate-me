const express = require('express');
const {
  getQRDetails,
  storeQRDetails,
  generateDonationQR
} = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes (for donation page QR display and creation)
router.get('/details', getQRDetails);
router.get('/generate', generateDonationQR);

// Protected routes (for admin configuration changes)
router.post(
  '/store',
  protect,
  authorize('Super Admin', 'Admin', 'Accountant'),
  storeQRDetails
);

module.exports = router;
