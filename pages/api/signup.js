// pages/api/signup.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  if (req.method === 'POST') {

    try {
      const { name, email, gender, age, college } = req.body;
      const user = new User({ name, email, gender, age, college });
      await user.save();
      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user.' });
    }
  }


};

export default connectToMongo(handler);
