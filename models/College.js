import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  college: {
    type: String,
    required: true,
    unique: true,
  },
  emailendswith: {
    type: String,
    required: true,
  },
}, { timestamps: true });


export default  mongoose.models.College || mongoose.model('College', CollegeSchema);
