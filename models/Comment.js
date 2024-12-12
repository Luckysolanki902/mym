// models/Comment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for replies
const replySchema = new Schema({
  replyContent: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  mid: {
    type: String,
    required: true,
    index: true, // Add index if frequently queried
  },
  likes: [{ type: String }],
}, { timestamps: true }); // Enable built-in timestamps

// Define the schema for comments
const commentSchema = new Schema({
  confessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
    index: true, // Add index for faster queries
  },
  commentContent: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  mid: {
    type: String,
    required: true,
    index: true, // Add index if frequently queried
  },
  likes: [{ type: String }],
  replies: [replySchema], // Array of replies
}, { timestamps: true }); // Enable built-in timestamps



const Comment =  mongoose.models.Comment || mongoose.model('Comment', commentSchema);

module.exports = Comment;
