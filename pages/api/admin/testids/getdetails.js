// pages/api/admin/testids/getdetails.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  try {
    const { testIds } = req.body;

    // Fetch users whose emails match the provided test IDs
    const users = await User.find({ email: { $in: testIds } });
    
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
