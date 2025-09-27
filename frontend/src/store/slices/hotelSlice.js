import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelAPI } from '../../services/api';

export const fetchHotels = createAsyncThunk(
  'hotel/fetchHotels',
  async (params, { rejectWithValue }) => {
    try {
      const response = await hotelAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hotels');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotel/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelAPI.getById(id);
      return response.data.data.hotel;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hotel');
    }
  }
);

const initialState = {
  hotels: [],
  currentHotel: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.hotels;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentHotel } = hotelSlice.actions;
export default hotelSlice.reducer;