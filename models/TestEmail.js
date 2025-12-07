const mongoose = require('mongoose');

const testEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.models.TestEmail || mongoose.model('TestEmail', testEmailSchema);
