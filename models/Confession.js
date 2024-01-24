const mongoose = require('mongoose');
const { Schema } = mongoose;

const confessionSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  encryptedEmail: {
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
  },
  gender: {
    type: String,
    required: true,
  },
  confessionContent: {
    type: String,
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Like',
  }],
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

mongoose.models = {};
const Confession = mongoose.model('Confession', confessionSchema);
module.exports = Confession;
