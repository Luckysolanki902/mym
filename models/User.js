import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';  // UUID library to generate unique ids

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
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
    index: true,
    required: true,
  },
  college: {
    type: String,
    required: true,
    index: true, 
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  otp: {
    type: String, // Store OTP as a string
    
  },
  otpCooldown: {
    type: Date, // Store cooldown as a Date
  },
  mid: {
    index: true,
    type: String,
    unique: true,
    default: () => uuidv4(),  // Generate unique id for mid
  },
  tokenId: {
    index: true,
    type: String,
    unique: true,
    default: () => uuidv4(),  // Generate unique id for tokenId
  },
}, { timestamps: true });



export default  mongoose.models.User ||  mongoose.model('User', UserSchema);
