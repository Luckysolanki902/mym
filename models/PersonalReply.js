import mongoose from 'mongoose';
import Confession from './Confession'; // Import Confession model

const PersonalReplySchema = new mongoose.Schema({
  confessionId: {
    type: String,
    required: true,
  },
  confesserEmail: {
    type: String,
    required: true,
  },
  confessionContent: {
    type: String,
    required: true,
  },
  replies: [
    {
      reply: String,
      replierGender: String,
    }
  ],
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const PersonalReply = mongoose.model('PersonalReply', PersonalReplySchema);

export default PersonalReply;
