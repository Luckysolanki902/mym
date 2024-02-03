// models/PersonalReply.js
import mongoose from 'mongoose';

const PersonalReplySchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
  },
  confesserEmail: {
    type: String,
    required: true,
  },
  replies: {
    type: [String],
    default: [],
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const PersonalReply = mongoose.model('PersonalReply', PersonalReplySchema);

export default PersonalReply;
