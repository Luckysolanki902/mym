// pages/api/admin/testids/getall.js
import connectToMongo from '@/middleware/middleware';
import TestEmail from '@/models/TestEmail';

const handler = async (req, res) => {
  try {
    const testEmails = await TestEmail.find({});
    return res.status(200).json(testEmails);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
