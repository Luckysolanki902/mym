const mongoose = require('mongoose');

const testEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.models.TestEmail || mongoose.model('TestEmail', testEmailSchema);
