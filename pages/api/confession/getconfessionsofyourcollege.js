import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Number of confessions per page

  try {
    const totalCount = await Confession.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const confessions = await Confession.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ confessions, totalPages });
  } catch (error) {
    console.error('Error fetching confessions:', error);
    res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
  }
};

export default connectToMongo(handler);
