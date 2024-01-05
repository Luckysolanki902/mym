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
  isVerified:{
    type: Boolean,
    default: false,
  }

}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt

mongoose.models = {};

export default mongoose.model('User', UserSchema);;
