import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';  // UUID library to generate unique ids

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(value);
      },
      message: (props) => `${props.value} is not a valid email address`,
    },
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
