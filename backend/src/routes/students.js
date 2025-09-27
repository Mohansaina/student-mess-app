const express = require('express');
const { Student, Hotel, User, Room } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');
const { uploadConfigs, getFileUrl, deleteFile } = require('../middleware/upload');
const { emitToHotel, emitToUser } = require('../config/socket');

const router = express.Router();

// @route   GET /api/students/:id
// @desc    Get student profile
// @access  Private (Student or Hotel Owner)
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email createdAt lastLogin')
      .populate('linkedHotelId', 'name address contactPhone')
      .populate('roomId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check access permissions
    const canAccess = req.userId === student.userId.toString() || 
                     req.userRole === 'admin' ||
                     (req.userRole === 'hotel_owner' && student.linkedHotelId && 
                      await Hotel.findOne({ _id: student.linkedHotelId, ownerUserId: req.userId }));

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { student }
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/students
// @desc    Create student profile
// @access  Private (Student)
router.post('/', 
  auth, 
  authorize('student'), 
  uploadConfigs.studentDocuments,
  studentValidation, 
  async (req, res) => {
    try {
      // Check if student profile already exists
      const existingStudent = await Student.findOne({ userId: req.userId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student profile already exists'
        });
      }

      // Check if student ID or mobile already exists
      const duplicateCheck = await Student.findOne({
        $or: [
          { studentId: req.body.studentId },
          { mobile: req.body.mobile }
        ]
      });

      if (duplicateCheck) {
        return res.status(400).json({
          success: false,
          message: 'Student ID or mobile number already exists'
        });
      }

      const studentData = {
        ...req.body,
        userId: req.userId
      };

      // Handle document uploads
      if (req.files) {
        if (req.files.idCard && req.files.idCard[0]) {
          studentData.documents = studentData.documents || {};
          studentData.documents.idCard = {
            url: getFileUrl(req.files.idCard[0].filename, 'documents')
          };
        }

        if (req.files.faceImage && req.files.faceImage[0]) {
          studentData.documents = studentData.documents || {};
          studentData.documents.faceImage = {
            url: getFileUrl(req.files.faceImage[0].filename, 'documents')
          };
        }
      }

      const student = new Student(studentData);
      await student.save();

      // Populate the response
      await student.populate('userId', 'email');

      res.status(201).json({
        success: true,
        message: 'Student profile created successfully',
        data: { student }
      });

    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating student profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/students/:id
// @desc    Update student profile
// @access  Private (Student)
router.put('/:id', 
  auth, 
  authorize('student'), 
  uploadConfigs.studentDocuments,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check ownership
      if (student.userId.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this profile'
        });
      }

      const updateData = { ...req.body };

      // Handle document updates
      if (req.files) {
        if (req.files.idCard && req.files.idCard[0]) {
          // Delete old ID card if exists
          if (student.documents?.idCard?.url) {
            const oldFileName = student.documents.idCard.url.split('/').pop();
            await deleteFile(oldFileName, 'documents');
          }
          updateData.documents = updateData.documents || student.documents || {};
          updateData.documents.idCard = {
            url: getFileUrl(req.files.idCard[0].filename, 'documents')
          };
        }

        if (req.files.faceImage && req.files.faceImage[0]) {
          // Delete old face image if exists
          if (student.documents?.faceImage?.url) {
            const oldFileName = student.documents.faceImage.url.split('/').pop();
            await deleteFile(oldFileName, 'documents');
          }
          updateData.documents = updateData.documents || student.documents || {};
          updateData.documents.faceImage = {
            url: getFileUrl(req.files.faceImage[0].filename, 'documents')
          };
          
          // Reset face verification if new image uploaded
          updateData.faceVerification = {
            ...student.faceVerification,
            isVerified: false,
            verifiedAt: null,
            verifiedBy: null,
            confidence: null
          };
        }
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'email')
       .populate('linkedHotelId', 'name address');

      res.json({
        success: true,
        message: 'Student profile updated successfully',
        data: { student: updatedStudent }
      });

    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating student profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/students/:id/link-hotel
// @desc    Request to link to a hotel
// @access  Private (Student)
router.post('/:id/link-hotel', auth, authorize('student'), async (req, res) => {
  try {
    const { hotelId } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check ownership
    if (student.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if student already has a hotel account
    if (student.linkedHotelId && student.hotelAccountStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You already have an approved hotel account'
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found or inactive'
      });
    }

    // Check if hotel has space
    if (hotel.currentStudents >= hotel.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Hotel has reached maximum capacity'
      });
    }

    // Update student
    student.linkedHotelId = hotelId;
    student.hotelAccountStatus = 'pending';
    student.hotelAccountRequestedAt = new Date();
    await student.save();

    // Send real-time notification to hotel owner
    if (req.io) {
      emitToHotel(req.io, hotelId, 'new_student_request', {
        message: `New student account request from ${student.name}`,
        studentId: student._id,
        studentName: student.name,
        studentId: student.studentId
      });
    }

    res.json({
      success: true,
      message: 'Hotel account request submitted successfully',
      data: { student }
    });

  } catch (error) {
    console.error('Link hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting hotel request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/students/:id/unlink-hotel
// @desc    Unlink from hotel
// @access  Private (Student)
router.post('/:id/unlink-hotel', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check ownership
    if (student.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!student.linkedHotelId) {
      return res.status(400).json({
        success: false,
        message: 'No hotel linked to unlink from'
      });
    }

    // Check for pending orders
    const pendingOrders = await require('../models').Order.countDocuments({
      studentId: student._id,
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink while you have pending orders'
      });
    }

    const hotelId = student.linkedHotelId;

    // Update student
    student.linkedHotelId = null;
    student.hotelAccountStatus = 'pending';
    student.roomId = null;
    await student.save();

    // Update hotel student count
    const hotel = await Hotel.findById(hotelId);
    if (hotel && hotel.currentStudents > 0) {
      hotel.currentStudents -= 1;
      await hotel.save();
    }

    // Remove from room if assigned
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room) {
        await room.removeStudent(student._id);
      }
    }

    res.json({
      success: true,
      message: 'Successfully unlinked from hotel',
      data: { student }
    });

  } catch (error) {
    console.error('Unlink hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unlinking from hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/students/:id/verify-face
// @desc    Verify student face (manual verification by hotel)
// @access  Private (Hotel Owner)
router.post('/:id/verify-face', auth, authorize('hotel_owner'), async (req, res) => {
  try {
    const { verified, confidence, notes } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if hotel owner can verify this student
    const hotel = await Hotel.findOne({ 
      ownerUserId: req.userId,
      _id: student.linkedHotelId 
    });

    if (!hotel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this student'
      });
    }

    // Update face verification
    student.faceVerification.isVerified = verified;
    student.faceVerification.verifiedAt = new Date();
    student.faceVerification.verifiedBy = req.userId;
    student.faceVerification.method = 'manual';
    
    if (confidence !== undefined) {
      student.faceVerification.confidence = confidence;
    }

    await student.save();

    // Send notification to student
    if (req.io) {
      emitToUser(req.io, student.userId, 'face_verification_update', {
        message: verified 
          ? 'Your face verification has been approved' 
          : 'Your face verification was not approved',
        verified,
        notes
      });
    }

    res.json({
      success: true,
      message: `Face verification ${verified ? 'approved' : 'rejected'}`,
      data: { 
        student: {
          faceVerification: student.faceVerification
        }
      }
    });

  } catch (error) {
    console.error('Verify face error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying face',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/students/:id/wallet
// @desc    Get student wallet details
// @access  Private (Student)
router.get('/:id/wallet', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check ownership
    if (student.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get recent transactions
    const { Transaction } = require('../models');
    const recentTransactions = await Transaction.findByStudent(student._id, 10);

    res.json({
      success: true,
      data: {
        balance: student.walletBalance,
        transactions: recentTransactions
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wallet details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/students/:id/orders
// @desc    Get student orders
// @access  Private (Student)
router.get('/:id/orders', auth, authorize('student'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check ownership
    if (student.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { Order } = require('../models');
    let query = { studentId: student._id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('hotelId', 'name address.city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get student orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;