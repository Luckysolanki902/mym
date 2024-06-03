import mongoose from 'mongoose';

const userFormSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  recreateBug: { type: String }, // Additional field for bug recreation
  collegeName: { type: String }, // Additional field for "Add My College"
  collegeId: { type: String }, // Additional field for "Add My College" and "Confession Delete Request"
});

mongoose.models = {};

const UserForm = mongoose.model('UserForm', userFormSchema);

export default UserForm;
