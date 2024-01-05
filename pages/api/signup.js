// pages/api/signup.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  if (req.method === 'POST') {

    try {
      const { email, gender, college } = req.body;
      const lowercaseEmail = email.toLowerCase(); // Converting email to lowercase
      const user = new User({ email: lowercaseEmail, gender, college, isVerified: false });
      await user.save();
      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user.' });
    }
  }
};

export default connectToMongo(handler);
