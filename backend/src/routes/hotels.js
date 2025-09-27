const express = require('express');
const { Hotel, Student, Room, Order } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { hotelValidation, menuItemValidation } = require('../middleware/validation');
const { uploadConfigs, getFileUrl, deleteFile } = require('../middleware/upload');
const { emitToHotel, emitToUser } = require('../config/socket');

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels or search hotels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      lat, 
      lng, 
      maxDistance = 10000, 
      page = 1, 
      limit = 10,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };
    let hotels;

    // Search by location (nearby)
    if (lat && lng) {
      hotels = await Hotel.findNearby(
        parseFloat(lng), 
        parseFloat(lat), 
        parseInt(maxDistance)
      );
    }
    // Search by text
    else if (search) {
      hotels = await Hotel.searchHotels(search);
    }
    // Filter by city/state
    else {
      if (city) query['address.city'] = new RegExp(city, 'i');
      if (state) query['address.state'] = new RegExp(state, 'i');
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      hotels = await Hotel.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-menu -paymentDetails');
    }

    // Calculate total count for pagination
    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hotels/:id
// @desc    Get single hotel
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('students', 'name studentId hotelAccountStatus')
      .select('-paymentDetails');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      data: { hotel }
    });

  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/hotels
// @desc    Create hotel profile
// @access  Private (Hotel Owner)
router.post('/', 
  auth, 
  authorize('hotel_owner'), 
  uploadConfigs.hotelProfile,
  hotelValidation, 
  async (req, res) => {
    try {
      // Check if hotel owner already has a hotel
      const existingHotel = await Hotel.findOne({ ownerUserId: req.userId });
      if (existingHotel) {
        return res.status(400).json({
          success: false,
          message: 'You already have a hotel profile'
        });
      }

      const hotelData = {
        ...req.body,
        ownerUserId: req.userId
      };

      // Add logo URL if uploaded
      if (req.file) {
        hotelData.logo = getFileUrl(req.file.filename, 'hotels');
      }

      const hotel = new Hotel(hotelData);
      await hotel.save();

      res.status(201).json({
        success: true,
        message: 'Hotel profile created successfully',
        data: { hotel }
      });

    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating hotel',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/hotels/:id
// @desc    Update hotel profile
// @access  Private (Hotel Owner)
router.put('/:id', 
  auth, 
  authorize('hotel_owner'), 
  uploadConfigs.hotelProfile,
  async (req, res) => {
    try {
      const hotel = await Hotel.findById(req.params.id);

      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      // Check ownership
      if (hotel.ownerUserId.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this hotel'
        });
      }

      const updateData = { ...req.body };

      // Handle logo update
      if (req.file) {
        // Delete old logo if exists
        if (hotel.logo) {
          const oldLogoName = hotel.logo.split('/').pop();
          await deleteFile(oldLogoName, 'hotels');
        }
        updateData.logo = getFileUrl(req.file.filename, 'hotels');
      }

      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Hotel profile updated successfully',
        data: { hotel: updatedHotel }
      });

    } catch (error) {
      console.error('Update hotel error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating hotel',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel profile
// @access  Private (Hotel Owner)
router.delete('/:id', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hotel'
      });
    }

    // Check if hotel has active students
    const activeStudents = await Student.countDocuments({
      linkedHotelId: hotel._id,
      hotelAccountStatus: 'approved'
    });

    if (activeStudents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hotel with active students. Please transfer or deactivate students first.'
      });
    }

    // Delete logo file
    if (hotel.logo) {
      const logoName = hotel.logo.split('/').pop();
      await deleteFile(logoName, 'hotels');
    }

    await Hotel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hotel profile deleted successfully'
    });

  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/hotels/:id/students
// @desc    Get students linked to hotel
// @access  Private (Hotel Owner)
router.get('/:id/students', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these students'
      });
    }

    let query = { linkedHotelId: req.params.id };
    if (status) {
      query.hotelAccountStatus = status;
    }

    const students = await Student.find(query)
      .populate('userId', 'email lastLogin')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get hotel students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/hotels/:id/students/:studentId/approve
// @desc    Approve student account request
// @access  Private (Hotel Owner)
router.post('/:id/students/:studentId/approve', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (student.linkedHotelId.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Student is not linked to this hotel'
      });
    }

    if (student.hotelAccountStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Student account is not in pending status'
      });
    }

    // Update student status
    student.hotelAccountStatus = 'approved';
    student.hotelAccountApprovedAt = new Date();
    await student.save();

    // Update hotel student count
    hotel.currentStudents += 1;
    await hotel.save();

    // Send real-time notification to student
    if (req.io) {
      emitToUser(req.io, student.userId, 'account_approved', {
        message: `Your account request for ${hotel.name} has been approved!`,
        hotelId: hotel._id,
        hotelName: hotel.name
      });
    }

    res.json({
      success: true,
      message: 'Student account approved successfully',
      data: { student }
    });

  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/hotels/:id/students/:studentId/reject
// @desc    Reject student account request
// @access  Private (Hotel Owner)
router.post('/:id/students/:studentId/reject', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update student status
    student.hotelAccountStatus = 'rejected';
    student.linkedHotelId = null;
    await student.save();

    // Send real-time notification to student
    if (req.io) {
      emitToUser(req.io, student.userId, 'account_rejected', {
        message: `Your account request for ${hotel.name} has been rejected.`,
        reason: reason || 'No reason provided',
        hotelId: hotel._id,
        hotelName: hotel.name
      });
    }

    res.json({
      success: true,
      message: 'Student account rejected',
      data: { student }
    });

  } catch (error) {
    console.error('Reject student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/hotels/:id/menu
// @desc    Add menu item
// @access  Private (Hotel Owner)
router.post('/:id/menu', auth, authorize('hotel_owner'), menuItemValidation, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    hotel.menu.push(req.body);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: { menu: hotel.menu }
    });

  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/hotels/:id/menu/:menuItemId
// @desc    Update menu item
// @access  Private (Hotel Owner)
router.put('/:id/menu/:menuItemId', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const menuItem = hotel.menu.id(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    Object.assign(menuItem, req.body);
    await hotel.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem }
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/hotels/:id/menu/:menuItemId
// @desc    Delete menu item
// @access  Private (Hotel Owner)
router.delete('/:id/menu/:menuItemId', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.ownerUserId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    hotel.menu.pull(req.params.menuItemId);
    await hotel.save();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;