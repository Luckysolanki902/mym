import mongoose from 'mongoose';

const userFormSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String },
  recreateBug: { type: String },
  collegeName: { type: String },
  collegeId: { type: String },
  confessionLink: { type: String },
  email: {type: String}
});

mongoose.models = {};

const UserForm = mongoose.model('UserForm', userFormSchema);

export default UserForm;
