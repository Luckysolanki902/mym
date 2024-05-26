// pages/api/admin/testids/add.js
import connectToMongo from '@/middleware/middleware';
import TestEmail from '@/models/TestEmail';

const handler = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email already exists
    const existingEmail = await TestEmail.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new TestEmail document and save it to the database
    const newTestEmail = new TestEmail({ email });
    await newTestEmail.save();

    return res.status(201).json({ message: 'Test email added successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
