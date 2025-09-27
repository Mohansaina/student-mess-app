import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from '../store/slices/notificationSlice';
import { updateOrder } from '../store/slices/orderSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, user, tokens } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken && user) {
      // Initialize socket connection
      const socketIO = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          token: tokens.accessToken,
        },
        transports: ['websocket'],
      });

      socketIO.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        
        // Join user-specific room
        if (user.role === 'hotel_owner' && user.profile?.hotelId) {
          socketIO.emit('join_hotel', user.profile.hotelId);
        } else if (user.role === 'student' && user.profile?.linkedHotelId) {
          socketIO.emit('join_hotel', user.profile.linkedHotelId);
        }
      });

      socketIO.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      // Listen for notifications
      socketIO.on('notification', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'New Notification',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: data.type || 'info',
        };
        
        dispatch(addNotification(notification));
        toast(data.message, {
          icon: getNotificationIcon(data.type),
        });
      });

      // Listen for account status updates
      socketIO.on('account_approved', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'Account Approved! 🎉',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'success',
        };
        
        dispatch(addNotification(notification));
        toast.success(data.message);
      });

      socketIO.on('account_rejected', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'Account Status Update',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'error',
        };
        
        dispatch(addNotification(notification));
        toast.error(data.message);
      });

      // Listen for order updates
      socketIO.on('order_status_update', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'Order Update',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        };
        
        dispatch(addNotification(notification));
        dispatch(updateOrder(data.order));
        
        toast(data.message, {
          icon: getOrderStatusIcon(data.status),
        });
      });

      // Listen for new order notifications (for hotel owners)
      socketIO.on('new_order', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'New Order! 🍽️',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        };
        
        dispatch(addNotification(notification));
        toast.success(data.message);
      });

      // Listen for new student requests (for hotel owners)
      socketIO.on('new_student_request', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'New Student Request',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
        };
        
        dispatch(addNotification(notification));
        toast(data.message, { icon: '👤' });
      });

      // Listen for face verification updates
      socketIO.on('face_verification_update', (data) => {
        const notification = {
          id: Date.now().toString(),
          title: 'Face Verification Update',
          message: data.message,
          timestamp: new Date().toISOString(),
          read: false,
          type: data.verified ? 'success' : 'warning',
        };
        
        dispatch(addNotification(notification));
        
        if (data.verified) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      });

      setSocket(socketIO);

      return () => {
        socketIO.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, tokens?.accessToken, user, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🍽️';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const value = {
    socket,
    connected,
    emit: (event, data) => {
      if (socket && connected) {
        socket.emit(event, data);
      }
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};