import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setAuthToken } from '../../services/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, profile, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set auth header
      setAuthToken(tokens.accessToken);
      
      return { user, profile, tokens };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set auth header
      setAuthToken(tokens.accessToken);
      
      return { user, tokens };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      setAuthToken(token);
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const { tokens } = refreshResponse.data.data;
          
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          setAuthToken(tokens.accessToken);
          
          const response = await api.get('/auth/me');
          return response.data.data;
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAuthToken(null);
          return rejectWithValue('Session expired');
        }
      }
      
      return rejectWithValue('Authentication failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthToken(null);
    
    return {};
  }
);

const initialState = {
  user: null,
  profile: null,
  tokens: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, updateProfile } = authSlice.actions;
export default authSlice.reducer;