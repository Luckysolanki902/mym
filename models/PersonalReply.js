// models/PersonalReply.js
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
  replierGender: {
    type: String,
    required: true,
  },
  seen: {
    type: [String],  // Array of strings to hold mid addresses
    default: [],
  },
}, { timestamps: true }); // Use Mongoose's timestamps

// Define the schema for primary replies
const PrimaryReplySchema = new mongoose.Schema({
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
  secondaryReplies: [SecondaryReplySchema],
}, { timestamps: true }); // Use Mongoose's timestamps

// Define the schema for personal replies
const PersonalReplySchema = new mongoose.Schema({
  confessionId: {
    type: String,
    required: true,
    index: true, // Adding index for faster queries
  },
  confessorMid: {
    type: String,
    required: true,
    index: true, // Adding index for faster queries
  },
  confessorGender: {
    type: String,
    required: true,
  },
  confessionContent: {
    type: String,
    required: true,
  },
  replies: [PrimaryReplySchema],
}, { timestamps: true }); // Use Mongoose's timestamps



// Create the model
const PersonalReply =  mongoose.models.PersonalReply ||  mongoose.model('PersonalReply', PersonalReplySchema);

export default PersonalReply;
