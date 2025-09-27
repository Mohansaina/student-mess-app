import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setOrders, addOrder, updateOrder, setCurrentOrder, setLoading, setError, clearError } = orderSlice.actions;
export default orderSlice.reducer;