const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  confessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  commentContent: {
    type: String,
    required: true,
  },
  gender: {
    type: String, // Assuming 'gender' can be 'male', 'female', or other values
    required: true,
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
