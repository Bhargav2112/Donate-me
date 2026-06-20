const QRConfig = require('../models/QRConfig');
const { generateUPIQR } = require('../services/qrService');
const QRCode = require('qrcode');

// GET /api/qr/details
const getQRDetails = async (req, res) => {
  try {
    let config = await QRConfig.findOne({ isActive: true });
    
    if (!config) {
      // Fallback to environment variables
      return res.status(200).json({
        success: true,
        source: 'env',
        data: {
          upiId: process.env.UPI_ID || 'aashram@upi',
          upiName: process.env.UPI_NAME || 'Aashram Trust'
        }
      });
    }

    res.status(200).json({
      success: true,
      source: 'database',
      data: {
        id: config._id,
        upiId: config.upiId,
        upiName: config.upiName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/qr/store
const storeQRDetails = async (req, res) => {
  try {
    const { upiId, upiName } = req.body;

    if (!upiId || !upiName) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID and Display Name are required'
      });
    }

    // Set all other configurations to inactive
    await QRConfig.updateMany({}, { isActive: false });

    const newConfig = await QRConfig.create({
      upiId,
      upiName,
      isActive: true
    });

    req.logAction = `Configured donation QR: ${newConfig.upiId}`;
    req.logDetails = { qrConfigId: newConfig._id };

    res.status(200).json({
      success: true,
      message: 'QR Code configurations stored successfully',
      data: newConfig
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/qr/generate
const generateDonationQR = async (req, res) => {
  try {
    const { amount, notes } = req.query;

    // Check if dynamic database configuration exists
    const config = await QRConfig.findOne({ isActive: true });
    const targetUpiId = config ? config.upiId : (process.env.UPI_ID || 'aashram@upi');
    const targetUpiName = config ? config.upiName : (process.env.UPI_NAME || 'Aashram Trust');

    // Build UPI payload URL
    let upiUrl = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(targetUpiName)}&cu=INR`;
    if (amount && Number(amount) > 0) {
      upiUrl += `&am=${encodeURIComponent(amount)}`;
    }
    if (notes) {
      upiUrl += `&tn=${encodeURIComponent(notes)}`;
    }

    // Render UPI payload as QRCode
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1a365d',
        light: '#ffffff'
      }
    });

    res.status(200).json({
      success: true,
      upiUrl,
      qrDataUrl,
      config: {
        upiId: targetUpiId,
        upiName: targetUpiName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQRDetails,
  storeQRDetails,
  generateDonationQR
};
