const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  members: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  capacity: {
    type: Number,
    default: 4,
    min: [1, 'Room capacity must be at least 1'],
    max: [6, 'Room capacity cannot exceed 6']
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  floor: {
    type: Number,
    min: [0, 'Floor cannot be negative']
  },
  roomType: {
    type: String,
    enum: ['shared', 'single', 'double', 'triple'],
    default: 'shared'
  },
  amenities: [{
    type: String,
    enum: ['ac', 'wifi', 'attached_bathroom', 'balcony', 'study_table', 'wardrobe', 'geyser']
  }],
  rent: {
    perPerson: {
      type: Number,
      required: [true, 'Rent per person is required'],
      min: [0, 'Rent cannot be negative']
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
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

// Compound index for hotel and room number uniqueness
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hotelId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ currentOccupancy: 1 });

// Virtual for hotel details
roomSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotelId',
  foreignField: '_id',
  justOne: true
});

// Virtual for student details
roomSchema.virtual('students', {
  ref: 'Student',
  localField: 'members.studentId',
  foreignField: '_id'
});

// Pre-save middleware to update current occupancy
roomSchema.pre('save', function(next) {
  this.currentOccupancy = this.members.length;
  
  // Update status based on occupancy
  if (this.currentOccupancy === 0) {
    this.status = 'available';
  } else if (this.currentOccupancy >= this.capacity) {
    this.status = 'occupied';
  } else {
    this.status = 'available';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Validation to ensure capacity is not exceeded
roomSchema.pre('save', function(next) {
  if (this.members.length > this.capacity) {
    return next(new Error(`Room capacity (${this.capacity}) exceeded`));
  }
  next();
});

// Validation to ensure only one primary member
roomSchema.pre('save', function(next) {
  const primaryMembers = this.members.filter(member => member.isPrimary);
  if (primaryMembers.length > 1) {
    return next(new Error('Only one primary member allowed per room'));
  }
  next();
});

// Method to add a student to the room
roomSchema.methods.addStudent = function(studentId, isPrimary = false) {
  // Check if room is full
  if (this.members.length >= this.capacity) {
    throw new Error('Room is already at full capacity');
  }
  
  // Check if student is already in the room
  const existingMember = this.members.find(member => 
    member.studentId.toString() === studentId.toString()
  );
  
  if (existingMember) {
    throw new Error('Student is already a member of this room');
  }
  
  // If this is set as primary, remove primary status from others
  if (isPrimary) {
    this.members.forEach(member => {
      member.isPrimary = false;
    });
  }
  
  this.members.push({
    studentId,
    isPrimary,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Method to remove a student from the room
roomSchema.methods.removeStudent = function(studentId) {
  const memberIndex = this.members.findIndex(member => 
    member.studentId.toString() === studentId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('Student is not a member of this room');
  }
  
  const wasPrimary = this.members[memberIndex].isPrimary;
  this.members.splice(memberIndex, 1);
  
  // If the removed student was primary, make the first remaining student primary
  if (wasPrimary && this.members.length > 0) {
    this.members[0].isPrimary = true;
  }
  
  return this.save();
};

// Method to check if room has space
roomSchema.methods.hasSpace = function() {
  return this.members.length < this.capacity && this.status === 'available';
};

// Method to get primary member
roomSchema.methods.getPrimaryMember = function() {
  return this.members.find(member => member.isPrimary);
};

// Static method to find available rooms in a hotel
roomSchema.statics.findAvailableByHotel = function(hotelId) {
  return this.find({
    hotelId,
    status: 'available',
    isActive: true,
    $expr: { $lt: ['$currentOccupancy', '$capacity'] }
  });
};

// Static method to find rooms by hotel
roomSchema.statics.findByHotel = function(hotelId) {
  return this.find({ hotelId, isActive: true });
};

module.exports = mongoose.model('Room', roomSchema);