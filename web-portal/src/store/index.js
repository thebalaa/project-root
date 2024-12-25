// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import analyticsReducer from './analytics/analyticsSlice';
import governanceReducer from './governance/governanceSlice';

export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    governance: governanceReducer,
  },
});
