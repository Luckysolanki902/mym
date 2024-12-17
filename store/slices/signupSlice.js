// store/slices/signupSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  password: '',
  gender: 'Select Gender',
  college: '',
  isTestId: false,
  otpToken: '', // JWT token received from send-otp API
  otpSentAt: null, // Timestamp when OTP was sent
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setSignupData: (state, action) => {
      const { email, password, gender, college, isTestId } = action.payload;
      state.email = email;
      state.password = password;
      state.gender = gender;
      state.college = college;
      state.isTestId = isTestId;
    },
    setOtpToken: (state, action) => {
      state.otpToken = action.payload;
    },
    setOtpSentAt: (state, action) => {
      state.otpSentAt = action.payload;
    },
    clearSignupData: (state) => {
      state.email = '';
      state.password = '';
      state.gender = 'Select Gender';
      state.college = '';
      state.isTestId = false;
      state.otpToken = '';
      state.otpSentAt = null;
    },
  },
});

export const { setSignupData, setOtpToken, setOtpSentAt, clearSignupData } = signupSlice.actions;
export default signupSlice.reducer;
