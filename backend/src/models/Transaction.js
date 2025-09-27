const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['topup', 'payment', 'refund', 'penalty', 'bonus'],
    required: [true, 'Transaction type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'cash', 'admin_adjustment'],
    required: function() {
      return this.type === 'topup';
    }
  },
  paymentGateway: {
    provider: {
      type: String,
      enum: ['razorpay', 'paytm', 'phonepe', 'gpay', 'manual']
    },
    transactionId: String,
    orderId: String,
    signature: String
  },
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedHotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  balanceBefore: {
    type: Number,
    required: [true, 'Previous balance is required'],
    min: [0, 'Balance cannot be negative']
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Updated balance is required'],
    min: [0, 'Balance cannot be negative']
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      state: String
    }
  },
  failureReason: String,
  processedAt: Date,
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
transactionSchema.index({ studentId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ relatedOrderId: 1 });
transactionSchema.index({ relatedHotelId: 1 });

// Virtual for student details
transactionSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for order details
transactionSchema.virtual('order', {
  ref: 'Order',
  localField: 'relatedOrderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for hotel details
transactionSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'relatedHotelId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last transaction ID for today
    const lastTransaction = await this.constructor.findOne({
      transactionId: new RegExp(`^TXN${year}${month}${day}`)
    }).sort({ transactionId: -1 });
    
    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionId.slice(-6));
      sequence = lastSequence + 1;
    }
    
    this.transactionId = `TXN${year}${month}${day}${sequence.toString().padStart(6, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to set processed time when status changes to completed
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

// Method to mark as completed
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// Method to mark as failed
transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Method to check if transaction can be cancelled
transactionSchema.methods.canBeCancelled = function() {
  return this.status === 'pending' && 
         ['topup', 'refund'].includes(this.type);
};

// Static method to find transactions by student
transactionSchema.statics.findByStudent = function(studentId, limit = 20) {
  return this.find({ studentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedOrderId', 'orderNumber total')
    .populate('relatedHotelId', 'name');
};

// Static method to find transactions by hotel
transactionSchema.statics.findByHotel = function(hotelId, startDate, endDate) {
  const query = { relatedHotelId: hotelId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('studentId', 'name studentId')
    .populate('relatedOrderId', 'orderNumber');
};

// Static method to get financial summary
transactionSchema.statics.getFinancialSummary = function(studentId, startDate, endDate) {
  const matchStage = { studentId: new mongoose.Types.ObjectId(studentId) };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        summary: {
          $push: {
            type: '$_id',
            totalAmount: '$totalAmount',
            count: '$count',
            avgAmount: '$avgAmount'
          }
        },
        totalTransactions: { $sum: '$count' },
        totalValue: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Static method to get daily revenue for hotel
transactionSchema.statics.getDailyRevenue = function(hotelId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        relatedHotelId: new mongoose.Types.ObjectId(hotelId),
        type: 'payment',
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to create topup transaction
transactionSchema.statics.createTopup = function(studentId, amount, paymentMethod, balanceBefore) {
  return this.create({
    studentId,
    amount,
    type: 'topup',
    paymentMethod,
    description: `Wallet topup of ₹${amount}`,
    balanceBefore,
    balanceAfter: balanceBefore + amount
  });
};

// Static method to create payment transaction
transactionSchema.statics.createPayment = function(studentId, orderId, hotelId, amount, balanceBefore) {
  return this.create({
    studentId,
    amount,
    type: 'payment',
    paymentMethod: 'wallet',
    relatedOrderId: orderId,
    relatedHotelId: hotelId,
    description: `Payment for order`,
    balanceBefore,
    balanceAfter: balanceBefore - amount
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);