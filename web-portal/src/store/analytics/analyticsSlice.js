// src/store/analytics/analyticsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {},
  loading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    fetchStatsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess(state, action) {
      state.loading = false;
      state.stats = action.payload;
    },
    fetchStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStatsStart,
  fetchStatsSuccess,
  fetchStatsFailure
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
