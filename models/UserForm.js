import mongoose from 'mongoose';

const userFormSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String },
  recreateBug: { type: String },
  collegeName: { type: String },
  collegeId: { type: String },
  confessionLink: { type: String },
  email: {
    type: String,
    validate: {
      validator: (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },
}, { timestamps: true });

mongoose.models = {};

const UserForm = mongoose.model('UserForm', userFormSchema);

export default UserForm;
