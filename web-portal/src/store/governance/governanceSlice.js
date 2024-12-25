// src/store/governance/governanceSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  proposals: [],
  loading: false,
  error: null
};

const governanceSlice = createSlice({
  name: 'governance',
  initialState,
  reducers: {
    fetchProposalsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProposalsSuccess(state, action) {
      state.loading = false;
      state.proposals = action.payload;
    },
    fetchProposalsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProposalsStart,
  fetchProposalsSuccess,
  fetchProposalsFailure
} = governanceSlice.actions;

export default governanceSlice.reducer;
