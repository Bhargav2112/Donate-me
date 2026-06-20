const Resident = require('../models/Resident');
const Staff = require('../models/Staff');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const Requirement = require('../models/Requirement');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total donations and verified donation totals
    const donations = await Donation.find();
    let totalDonatedAmount = 0;
    let pendingDonationsCount = 0;
    
    donations.forEach(d => {
      if (d.verificationStatus === 'Verified') {
        totalDonatedAmount += d.amount;
      } else if (d.verificationStatus === 'Pending') {
        pendingDonationsCount++;
      }
    });

    // 2. Active resident count
    const activeResidentsCount = await Resident.countDocuments({ status: 'Active' });

    // 3. Active staff count
    const activeStaffCount = await Staff.countDocuments({ status: 'Active' });

    // 4. Volunteer count
    const volunteersCount = await Volunteer.countDocuments();

    // 5. Upcoming events
    const today = new Date();
    const upcomingEventsCount = await Event.countDocuments({ date: { $gte: today } });

    // 6. Pending Requirements
    const pendingRequirementsCount = await Requirement.countDocuments({
      status: { $in: ['Pending', 'Partially Fulfilled'] }
    });

    // 7. Recent Donations (last 5, populated with donor information)
    const recentDonations = await Donation.find()
      .populate('donorId', 'name email mobile')
      .sort({ donationDate: -1 })
      .limit(5);

    // 8. Recent Activities (last 5, populated with user info)
    const recentActivities = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ timestamp: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalDonationsAmount: totalDonatedAmount,
        activeResidents: activeResidentsCount,
        activeStaff: activeStaffCount,
        totalVolunteers: volunteersCount,
        pendingDonations: pendingDonationsCount,
        upcomingEvents: upcomingEventsCount,
        pendingRequirements: pendingRequirementsCount
      },
      recentDonations,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
