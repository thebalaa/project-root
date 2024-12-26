// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import analyticsReducer from './analytics/analyticsSlice';
import governanceReducer from './governance/governanceSlice';
import agentsReducer from './agents/agentsSlice';
import authReducer from './auth/authSlice';

const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    governance: governanceReducer,
    agents: agentsReducer,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
