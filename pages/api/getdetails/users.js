import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const handler = async (req, res) => {
  
  try {
    const users = await User.find({}); // Fetch all users from the database
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch users" });
  }
};

const getUsersHandler = connectToMongo(handler); // Apply the middleware

export default getUsersHandler;
