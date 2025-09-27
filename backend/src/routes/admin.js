const express = require('express');
const { User, Hotel, Student, Order, Transaction } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalHotels,
      totalStudents,
      totalOrders,
      totalRevenue,
      recentOrders,
      topHotels
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Hotel.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'payment', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10)
        .populate('studentId', 'name')
        .populate('hotelId', 'name'),
      Hotel.find({ isActive: true })
        .sort({ currentStudents: -1 })
        .limit(5)
        .select('name currentStudents maxStudents')
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalHotels,
          totalStudents,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        topHotels
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;