import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';
const handler = async (req, res) => {
    const { email, college, gender, confessionContent } = req.body;
    try {
      const newConfession = new Confession({
        email,
        college,
        gender,
        confessionContent: confessionContent,
      });
      const savedConfession = await newConfession.save();
      res.status(201).json({ message: 'Confession stored successfully', savedConfession });
    } catch (error) {
      console.error('Error storing confession:', error);
      res.status(500).json({ error: 'Unable to store confession', detailedError: error.message });
    }
  };
  
  export default connectToMongo(handler);
  