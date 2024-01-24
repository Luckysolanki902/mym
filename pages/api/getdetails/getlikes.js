// pages/api/confession/getlikes.js
import Like from '@/models/Like';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { confessionId } = req.query;

  try {
    // Find likes for the given confessionId
    const likes = await Like.find({ confessionId });

    res.status(200).json({ likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Unable to fetch likes', detailedError: error.message });
  }
};

export default connectToMongo(handler);
