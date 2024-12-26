import { validateAgent } from '../../utils/agentValidation';

export const addAgent = createAsyncThunk(
  'agents/addAgent',
  async (newAgent: Agent, { rejectWithValue }) => {
    const { valid, errors } = validateAgent(newAgent);
    if (!valid) {
      return rejectWithValue(errors);
    }
    try {
      // Proceed with API call to create agent
      const response = await agentService.createAgent(newAgent);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
); 