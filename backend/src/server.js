const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');
const socketConfig = require('./config/socket');

// Import routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const studentRoutes = require('./routes/students');
const roomRoutes = require('./routes/rooms');
const orderRoutes = require('./routes/orders');
const transactionRoutes = require('./routes/transactions');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Configure Socket.io
socketConfig(io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📚 Environment: ${process.env.NODE_ENV}
🌐 CORS enabled for: ${process.env.FRONTEND_URL}
🔗 API Base URL: http://localhost:${PORT}/api
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, server, io };