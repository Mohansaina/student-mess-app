const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  roomNumber: {
    type: String,
    trim: true
  },
  groupMembers: [{
    name: {
      type: String,
      required: [true, 'Group member name is required'],
      trim: true
    },
    studentId: {
      type: String,
      trim: true,
      uppercase: true
    },
    mobile: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    }
  }],
  fatherName: {
    type: String,
    required: [true, 'Father/Guardian name is required'],
    trim: true
  },
  fatherPhone: {
    type: String,
    required: [true, 'Father/Guardian phone is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    relation: {
      type: String,
      required: [true, 'Emergency contact relation is required']
    }
  },
  college: {
    name: {
      type: String,
      required: [true, 'College/University name is required']
    },
    address: String,
    course: String,
    year: {
      type: Number,
      min: 1,
      max: 6
    }
  },
  documents: {
    idCard: {
      url: {
        type: String,
        required: [true, 'Student ID card is required']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    faceImage: {
      url: {
        type: String,
        required: [true, 'Face image is required']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  faceVerification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    method: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic'
    },
    consentGiven: {
      type: Boolean,
      required: [true, 'Face verification consent is required'],
      default: false
    }
  },
  linkedHotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    default: null
  },
  hotelAccountStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  hotelAccountRequestedAt: Date,
  hotelAccountApprovedAt: Date,
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  preferences: {
    dietaryType: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'both'
    },
    messTimings: {
      breakfast: { type: Boolean, default: true },
      lunch: { type: Boolean, default: true },
      dinner: { type: Boolean, default: true }
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  messHistory: [{
    date: {
      type: Date,
      required: true
    },
    meals: {
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false }
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation for group members (max 4 per group including the student)
studentSchema.pre('save', function(next) {
  if (this.groupMembers && this.groupMembers.length > 3) {
    return next(new Error('A room group cannot have more than 4 members including the primary student'));
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ mobile: 1 });
studentSchema.index({ linkedHotelId: 1 });
studentSchema.index({ hotelAccountStatus: 1 });
studentSchema.index({ createdAt: -1 });

// Virtual for user details
studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for hotel details
studentSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'linkedHotelId',
  foreignField: '_id',
  justOne: true
});

// Virtual for room details
studentSchema.virtual('room', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

// Virtual for orders
studentSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'studentId'
});

// Virtual for transactions
studentSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'studentId'
});

// Method to check if student can order food
studentSchema.methods.canOrderFood = function() {
  return this.hotelAccountStatus === 'approved' && 
         this.linkedHotelId && 
         this.isActive &&
         this.walletBalance > 0;
};

// Method to add wallet balance
studentSchema.methods.addToWallet = function(amount) {
  this.walletBalance += amount;
  return this.save();
};

// Method to deduct from wallet
studentSchema.methods.deductFromWallet = function(amount) {
  if (this.walletBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  this.walletBalance -= amount;
  return this.save();
};

// Static method to find students by hotel
studentSchema.statics.findByHotel = function(hotelId) {
  return this.find({ linkedHotelId: hotelId, isActive: true });
};

// Static method to find pending requests for a hotel
studentSchema.statics.findPendingRequests = function(hotelId) {
  return this.find({ 
    linkedHotelId: hotelId, 
    hotelAccountStatus: 'pending',
    isActive: true 
  });
};

module.exports = mongoose.model('Student', studentSchema);