const jwt = require('jsonwebtoken');

const socketConfig = (io) => {
  // Middleware for socket authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userId} connected (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join hotel owners to their hotel room
    if (socket.userRole === 'hotel_owner') {
      socket.on('join_hotel', (hotelId) => {
        socket.join(`hotel_${hotelId}`);
        console.log(`🏨 Hotel owner joined hotel room: ${hotelId}`);
      });
    }

    // Join students to their linked hotel room
    if (socket.userRole === 'student') {
      socket.on('join_hotel', (hotelId) => {
        socket.join(`hotel_${hotelId}`);
        console.log(`🎓 Student joined hotel room: ${hotelId}`);
      });
    }

    // Handle real-time messaging (future feature)
    socket.on('send_message', (data) => {
      // Broadcast to hotel room or specific user
      const { to, message, type } = data;
      
      if (type === 'hotel') {
        socket.to(`hotel_${to}`).emit('new_message', {
          from: socket.userId,
          message,
          timestamp: new Date()
        });
      } else if (type === 'user') {
        socket.to(`user_${to}`).emit('new_message', {
          from: socket.userId,
          message,
          timestamp: new Date()
        });
      }
    });

    // Handle order status updates
    socket.on('order_update', (data) => {
      const { orderId, status, userId } = data;
      socket.to(`user_${userId}`).emit('order_status_update', {
        orderId,
        status,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Helper functions to emit notifications
const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date()
  });
};

const emitToHotel = (io, hotelId, event, data) => {
  io.to(`hotel_${hotelId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

module.exports = socketConfig;
module.exports.emitNotification = emitNotification;
module.exports.emitToHotel = emitToHotel;
module.exports.emitToUser = emitToUser;