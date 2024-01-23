import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String, // Store OTP as a string
  },
  otpCooldown: {
    type: Date, // Store cooldown as a Date
  },
}, { timestamps: true });

mongoose.models = {};

export default mongoose.model('User', UserSchema);
