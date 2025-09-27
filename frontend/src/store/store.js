import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import hotelSlice from './slices/hotelSlice';
import studentSlice from './slices/studentSlice';
import orderSlice from './slices/orderSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    hotel: hotelSlice,
    student: studentSlice,
    order: orderSlice,
    notification: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Export types for TypeScript usage if needed
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;