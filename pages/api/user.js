// api/user.js

import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { email, college, gender } = req.query;

    try {
      let query = { email };

      if (college && college.toLowerCase() !== 'any') {
        query.college = college;
      }

      if (gender && gender.toLowerCase() !== 'any') {
        query.gender = gender;
      }

      const user = await User.findOne(query);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default connectToMongo(handler);
