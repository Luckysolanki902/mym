// pages/api/admin/testids/updategender.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  try {
    const { email, gender } = req.body;

    // Update the gender of the user with the specified email
    const user = await User.findOneAndUpdate(
      { email },
      { gender },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Gender updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
