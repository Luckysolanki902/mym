// pages/api/getdetails/getcolleges.js
import connectToMongo from '@/middleware/middleware';
import College from '@/models/College';

const handler = async (req, res) => {
  try {
    const colleges = await College.find({}); // Fetch all users from the database
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch colleges" });
  }
};

const getCollegesHandler = connectToMongo(handler); // Apply the middleware

export default getCollegesHandler;
