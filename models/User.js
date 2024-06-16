import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';  // UUID library to generate unique ids

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
  mid: {
    type: String,
    unique: true,
    default: () => uuidv4(),  // Generate unique id for mid
  },
  tokenId: {
    type: String,
    unique: true,
    default: () => uuidv4(),  // Generate unique id for tokenId
  },
}, { timestamps: true });

mongoose.models = {};

export default mongoose.model('User', UserSchema);
