import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { email, gender, college, isTestId } = req.body;
      const lowercaseEmail = email.toString().toLowerCase(); // Converting email to lowercase

      let isVerified = false; // By default, not verified
      
      if (isTestId) {
        isVerified = true; // If test ID, mark as verified
      }

      const user = new User({ email: lowercaseEmail, gender, college, isVerified });
      await user.save();

      console.log('User saved successfully.');

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default connectToMongo(handler);
