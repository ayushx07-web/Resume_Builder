import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  resumes: [],
  currentResume: null,
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResumes: (state, action) => {
      state.resumes = action.payload;
    },
    setCurrentResume: (state, action) => {
      state.currentResume = action.payload;
    },
    addResume: (state, action) => {
      state.resumes.push(action.payload);
    },
    updateResume: (state, action) => {
      const index = state.resumes.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.resumes[index] = action.payload;
      }
    },
    deleteResume: (state, action) => {
      state.resumes = state.resumes.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setResumes,
  setCurrentResume,
  addResume,
  updateResume,
  deleteResume,
  setLoading,
  setError,
} = resumeSlice.actions;

export default resumeSlice.reducer;
