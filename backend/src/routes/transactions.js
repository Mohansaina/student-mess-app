const express = require('express');
const { Transaction, Student, Hotel } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    let studentId;
    if (req.userRole === 'student') {
      const student = await Student.findOne({ userId: req.userId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
      studentId = student._id;
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = { studentId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('relatedOrderId', 'orderNumber')
      .populate('relatedHotelId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/transactions/topup
// @desc    Create wallet topup transaction
// @access  Private (Student)
router.post('/topup', auth, authorize('student'), transactionValidation, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const student = await Student.findOne({ userId: req.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Create transaction
    const transaction = await Transaction.createTopup(
      student._id,
      amount,
      paymentMethod,
      student.walletBalance
    );

    // In a real app, you would integrate with payment gateway here
    // For demo purposes, we'll mark it as completed immediately
    transaction.paymentGateway = {
      provider: 'demo',
      transactionId: `DEMO_${Date.now()}`,
      orderId: `ORDER_${Date.now()}`
    };
    
    await transaction.markCompleted();
    await student.addToWallet(amount);

    res.status(201).json({
      success: true,
      message: 'Wallet topup successful',
      data: { 
        transaction,
        newBalance: student.walletBalance
      }
    });

  } catch (error) {
    console.error('Topup transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing topup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('studentId', 'name studentId')
      .populate('relatedOrderId', 'orderNumber')
      .populate('relatedHotelId', 'name');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check access permissions
    const student = await Student.findOne({ userId: req.userId });
    const hotel = await Hotel.findOne({ ownerUserId: req.userId });
    
    const canAccess = 
      (student && transaction.studentId._id.toString() === student._id.toString()) ||
      (hotel && transaction.relatedHotelId && transaction.relatedHotelId._id.toString() === hotel._id.toString()) ||
      req.userRole === 'admin';

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { transaction } });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/transactions/summary/:studentId
// @desc    Get financial summary for student
// @access  Private (Student or Admin)
router.get('/summary/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check permissions
    if (req.userRole !== 'admin' && student.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    
    const summary = await Transaction.getFinancialSummary(
      student._id,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: {
        summary: summary[0] || { summary: [], totalTransactions: 0, totalValue: 0 },
        currentBalance: student.walletBalance
      }
    });

  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;