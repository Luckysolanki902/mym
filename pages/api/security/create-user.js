// pages/api/security/create-user.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { email, password, gender, college, isTestId } = req.body;
      const lowercaseEmail = email.toString().toLowerCase(); // Converting email to lowercase

      // Create user in Firebase
      const authResult = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = authResult.user;

      // Create user in MongoDB
      let isVerified = false; // By default, not verified

      if (isTestId) {
        isVerified = true; // If test ID, mark as verified
      }

      const user = new User({ email: lowercaseEmail, gender, college, isVerified });
      await user.save();

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user.', error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default connectToMongo(handler);
