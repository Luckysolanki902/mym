// /pages/api/submit-form.js
import connectToMongo from '@/middleware/middleware';
import UserForm from '@/models/UserForm';

const handler = async (req, res) => {
  
  try {
    const {category, description, recreateBug, collegeName, collegeId, confessionLink, email } = req.body;

    // Create a new UserForm document and save it to the database
    const newUserForm = new UserForm({ category, description, recreateBug, collegeName, collegeId, confessionLink, email });
    await newUserForm.save();

    return res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
