const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner user ID is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  logo: {
    type: String, // URL to logo image
    default: null
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'laundry', 'parking', 'gym', 'library', 'common_room', 'kitchen', 'ac', 'study_hall']
  }],
  menu: [{
    name: {
      type: String,
      required: [true, 'Menu item name is required']
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'],
      required: [true, 'Category is required']
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: String
  }],
  pricing: {
    dailyMess: {
      type: Number,
      required: [true, 'Daily mess price is required'],
      min: [0, 'Price cannot be negative']
    },
    monthlyMess: {
      type: Number,
      required: [true, 'Monthly mess price is required'],
      min: [0, 'Price cannot be negative']
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative']
    }
  },
  paymentDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  maxStudents: {
    type: Number,
    default: 100,
    min: [1, 'Maximum students must be at least 1']
  },
  currentStudents: {
    type: Number,
    default: 0
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

// Create 2dsphere index for geospatial queries
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ 'address.pincode': 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ isVerified: 1 });
hotelSchema.index({ createdAt: -1 });

// Virtual for students
hotelSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'linkedHotelId'
});

// Virtual for rooms
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotelId'
});

// Virtual for orders
hotelSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'hotelId'
});

// Pre-save middleware
hotelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find nearby hotels
hotelSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  });
};

// Static method to search hotels
hotelSchema.statics.searchHotels = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { name: searchRegex },
      { 'address.city': searchRegex },
      { 'address.state': searchRegex }
    ],
    isActive: true
  });
};

// Method to calculate distance from a point
hotelSchema.methods.getDistanceFrom = function(longitude, latitude) {
  const [hotelLng, hotelLat] = this.location.coordinates;
  
  // Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (latitude - hotelLat) * Math.PI / 180;
  const dLng = (longitude - hotelLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(hotelLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

module.exports = mongoose.model('Hotel', hotelSchema);