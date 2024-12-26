// src/store/auth/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../index';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  // Add more user fields as needed
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  status: 'idle',
  error: null,
};

/**
 * Async thunk for user login.
 */
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials: LoginCredentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  return response.data;
});

/**
 * Async thunk for user logout.
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  // Perform any necessary cleanup or API calls on logout
  localStorage.removeItem('authToken');
});

/**
 * Async thunk for user registration.
 */
export const registerUser = createAsyncThunk('auth/registerUser', async (userData: RegisterData) => {
  const response = await axios.post('/api/auth/register', userData);
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Additional synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to login';
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to register';
      });
  },
});

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
