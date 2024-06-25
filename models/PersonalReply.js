import mongoose from 'mongoose';

// Define the schema for secondary replies
const SecondaryReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sentBy: {
    type: String,
    required: true,
  },
  sentByConfessor: {
    type: Boolean,
    required: true,
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
  replierGender: {
    type: String,
    required: true,
  },
  seen: {
    type: [String],  // Array of strings to hold mid addresses
    default: [],
  },
});

// Define the schema for personal replies
const PersonalReplySchema = new mongoose.Schema({
  confessionId: {
    type: String,
    required: true,
  },
  confessorMid: {
    type: String,
    required: true,
  },
  confessorGender: {
    type: String,
    required: true,
  },
  confessionContent: {
    type: String,
    required: true,
  },
  replies: [
    {
      reply: {
        type: String,
        required: true,
      },
      replierMid: {
        type: String,
        required: true,
      },
      replierGender: {
        type: String,
        required: true,
      },
      seen: {
        type: [String],  // Array of strings to hold mid addresses
        default: [],
      },
      timestamps: {
        type: Date,
        default: Date.now,
      },
      secondaryReplies: [SecondaryReplySchema],
    },
  ],
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const PersonalReply = mongoose.model('PersonalReply', PersonalReplySchema);

export default PersonalReply;
