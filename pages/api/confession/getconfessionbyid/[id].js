// pages/api/confession/getconfessionbyid/[id].js
import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    res.status(200).json(confession);
  } catch (error) {
    console.error('Error fetching confession by ID:', error);
    res.status(500).json({ error: 'Unable to fetch confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
