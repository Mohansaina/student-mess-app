const express = require('express');
const { Order, Student, Hotel, Transaction } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');
const { emitToHotel, emitToUser } = require('../config/socket');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Student)
router.post('/', auth, authorize('student'), orderValidation, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student || !student.canOrderFood()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order. Check your account status and wallet balance.'
      });
    }

    const hotel = await Hotel.findById(student.linkedHotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const orderData = {
      ...req.body,
      studentId: student._id,
      hotelId: hotel._id
    };

    const order = new Order(orderData);
    order.calculateEstimatedDelivery();
    
    // Check wallet balance
    if (student.walletBalance < order.total) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct from wallet and create transaction
    await student.deductFromWallet(order.total);
    await Transaction.createPayment(
      student._id, 
      order._id, 
      hotel._id, 
      order.total, 
      student.walletBalance + order.total
    );

    order.paymentStatus = 'paid';
    await order.save();

    // Notify hotel
    if (req.io) {
      emitToHotel(req.io, hotel._id, 'new_order', {
        message: `New order from ${student.name}`,
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('studentId', 'name studentId')
      .populate('hotelId', 'name address contactPhone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check access permissions
    const student = await Student.findOne({ userId: req.userId });
    const hotel = await Hotel.findOne({ ownerUserId: req.userId });
    
    const canAccess = 
      (student && order.studentId._id.toString() === student._id.toString()) ||
      (hotel && order.hotelId._id.toString() === hotel._id.toString()) ||
      req.userRole === 'admin';

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { order } });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Hotel Owner)
router.put('/:id/status', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const hotel = await Hotel.findOne({ ownerUserId: req.userId });
    if (!hotel || order.hotelId.toString() !== hotel._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await order.updateStatus(status, note);

    // Notify student
    if (req.io) {
      emitToUser(req.io, order.studentId, 'order_status_update', {
        message: `Order ${order.orderNumber} is now ${status}`,
        orderId: order._id,
        status,
        note
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (Student)
router.post('/:id/cancel', auth, authorize('student'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const student = await Student.findOne({ userId: req.userId });
    if (!student || order.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    await order.updateStatus('cancelled', 'Cancelled by student');

    // Refund to wallet
    if (order.paymentStatus === 'paid') {
      await student.addToWallet(order.total);
      await Transaction.create({
        studentId: student._id,
        amount: order.total,
        type: 'refund',
        description: `Refund for cancelled order ${order.orderNumber}`,
        balanceBefore: student.walletBalance - order.total,
        balanceAfter: student.walletBalance,
        relatedOrderId: order._id,
        status: 'completed'
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get orders for a user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await Student.findOne({ userId: req.params.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const orders = await Order.findByStudent(student._id, parseInt(req.query.limit) || 10);

    res.json({ success: true, data: { orders } });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;