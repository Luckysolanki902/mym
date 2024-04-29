// pages/api/admin/addcollege.js
import connectToMongo from '@/middleware/middleware';
import College from '@/models/College';

const handler = async (req, res) => {
  try {
    const { college, emailEndsWith } = req.body;

    // Check if the college already exists
    const existingCollege = await College.findOne({ college });

    if (existingCollege) {
      return res.status(400).json({ message: 'College already exists' });
    }

    // Create a new College document and save it to the database
    const newCollege = new College({ college, emailendswith: emailEndsWith });
    await newCollege.save();

    return res.status(201).json({ message: 'College added successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);
