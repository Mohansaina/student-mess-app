const express = require('express');
const { Room, Hotel, Student } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { roomValidation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private (Hotel Owner)
router.post('/', auth, authorize('hotel_owner'), roomValidation, async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ ownerUserId: req.userId });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel profile not found' });
    }

    const roomData = { ...req.body, hotelId: hotel._id };
    const room = new Room(roomData);
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotelId', 'name address')
      .populate('members.studentId', 'name studentId');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, data: { room } });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Hotel Owner)
router.put('/:id', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const hotel = await Hotel.findOne({ ownerUserId: req.userId });
    if (!hotel || room.hotelId.toString() !== hotel._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room: updatedRoom }
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating room',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;