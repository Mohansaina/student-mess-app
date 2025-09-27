import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearProfile: (state) => {
      state.profile = null;
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

export const { setProfile, updateProfile, clearProfile, setLoading, setError, clearError } = studentSlice.actions;
export default studentSlice.reducer;