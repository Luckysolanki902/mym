// api/getmails.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  
  try {
    // Fetch all user emails from the User model
    const users = await User.find({}, { email: 1 });

    const emails = users.map((user) => user.email);

    return res.status(200).json(emails);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
