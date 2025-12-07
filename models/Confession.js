// models/Confession.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const confessionSchema = new Schema({
  encryptedMid: {
    type: String,
    required: true,
  },
  iv: {
    type: String, // Storing the IV as a string
    required: true,
  },
  college: {
    type: String,
    required: true,
    index: true, 
  },
  gender: { 
    type: String,
    required: true,
    index: true
  },
  confessionContent: {
    type: String,
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Like',
  }],
  showForAllColleges: {
    type: String,
    index: true,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, { timestamps: true }); // Enable built-in timestamps


// Create the model
const Confession =  mongoose.models.Confession || mongoose.model('Confession', confessionSchema);

export default Confession;
