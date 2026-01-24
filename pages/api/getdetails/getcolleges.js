// pages/api/getdetails/getcolleges.js
import connectToMongo from '@/middleware/middleware';
import College from '@/models/College';

const handler = async (req, res) => {
  try {
    // Fetch all colleges from the database, sorted alphabetically
    const colleges = await College.find({})
      .sort({ college: 1 }) // Alphabetical order
      .lean();
    res.status(200).json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: "Unable to fetch colleges" });
  }
};

const getCollegesHandler = connectToMongo(handler); // Apply the middleware

export default getCollegesHandler;
