// store/slices/unverifiedUserDetailsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  gender: '',
  college: '',
  mid: '',
  lastDialogShownAt: null, // Timestamp to track last dialog display
};

const unverifiedUserDetailsSlice = createSlice({
  name: 'unverifiedUserDetails',
  initialState,
  reducers: {
    setUnverifiedUserDetails: (state, action) => {
      state.gender = action.payload.gender;
      state.college = action.payload.college;
      state.mid = uuidv4();
      state.lastDialogShownAt = new Date().getTime();
      console.log("unverifiedUserDetails updated:", state);
    },
    setLastDialogShownAt: (state, action) => {
      state.lastDialogShownAt = action.payload;
    },
    clearUnverifiedUserDetails: (state) => {
      state.gender = '';
      state.college = '';
      state.mid = '';
      state.lastDialogShownAt = null;
    },
  },
});

export const {
  setUnverifiedUserDetails,
  setLastDialogShownAt,
  clearUnverifiedUserDetails,
} = unverifiedUserDetailsSlice.actions;

export default unverifiedUserDetailsSlice.reducer;
