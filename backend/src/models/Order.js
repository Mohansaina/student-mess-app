const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    menuItemId: {
      type: String,
      required: [true, 'Menu item ID is required']
    },
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
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
    specialInstructions: String
  }],
  orderType: {
    type: String,
    enum: ['daily_meal', 'ala_carte', 'monthly_plan'],
    required: [true, 'Order type is required']
  },
  mealPlan: {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'full_day']
    },
    startDate: Date,
    endDate: Date,
    daysCount: Number
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Taxes cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'online', 'cash'],
    default: 'wallet'
  },
  deliveryTime: {
    requested: Date,
    estimated: Date,
    actual: Date
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
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

// Indexes
orderSchema.index({ studentId: 1 });
orderSchema.index({ hotelId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'deliveryTime.estimated': 1 });

// Virtual for student details
orderSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for hotel details
orderSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotelId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order number for today
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^ORD${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `ORD${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate total
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount') || this.isModified('taxes')) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.taxes - this.discount;
  }
  next();
});

// Pre-save middleware to add status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, note) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
  return this.save();
};

// Method to calculate estimated delivery time
orderSchema.methods.calculateEstimatedDelivery = function() {
  const now = new Date();
  const estimatedMinutes = this.items.length * 5 + 15; // 5 min per item + 15 min base
  this.deliveryTime.estimated = new Date(now.getTime() + estimatedMinutes * 60000);
  return this.deliveryTime.estimated;
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if order can be rated
orderSchema.methods.canBeRated = function() {
  return this.status === 'delivered' && !this.rating.score;
};

// Static method to find orders by student
orderSchema.statics.findByStudent = function(studentId, limit = 10) {
  return this.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('hotel', 'name address.city');
};

// Static method to find orders by hotel
orderSchema.statics.findByHotel = function(hotelId, status = null) {
  const query = { hotelId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('student', 'name studentId mobile');
};

// Static method to find pending orders
orderSchema.statics.findPending = function(hotelId) {
  return this.find({
    hotelId,
    status: { $in: ['pending', 'confirmed', 'preparing'] }
  }).sort({ createdAt: 1 });
};

// Static method to get daily stats
orderSchema.statics.getDailyStats = function(hotelId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        hotelId: new mongoose.Types.ObjectId(hotelId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        ordersByStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);