// models/User.js
import mongoose from 'mongoose';

const MailMarketingUserSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  },
  sentCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.MailMarketingUser || mongoose.model('MailMarketingUser', MailMarketingUserSchema);
