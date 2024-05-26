const mongoose = require('mongoose');
const { Schema } = mongoose;

const replySchema = new Schema({
  replyContent: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  likes: [{ type: String }],
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new Schema({
  confessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
  },
  commentContent: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  likes: [{ type: String }],
  replies: [replySchema], // Array of replies
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

