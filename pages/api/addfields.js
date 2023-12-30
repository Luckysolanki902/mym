// pages/api/updateUserFields.js

import User from '@/models/User'; // Update the path to your User model
import connectToMongo from '@/middleware/middleware';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await User.updateMany(
        {},
        { $set: { isPaired: false, isActive: false } },
        { multi: true }
      );

      return res.status(200).json({ message: 'Fields updated successfully for all users.' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default connectToMongo(handler);
