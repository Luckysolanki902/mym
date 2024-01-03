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
  age: {
    type: Number,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },

}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt

mongoose.models = {};

export default mongoose.model('User', UserSchema);;
