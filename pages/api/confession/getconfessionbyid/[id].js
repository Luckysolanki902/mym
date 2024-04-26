// pages/api/confession/getconfessionbyid/[id].js
import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';
import Comment from '@/models/Comment';

const handler = async (req, res) => {
  
  const { id } = req.query;
  console.log(id)

  try {
    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ error: 'Confession not found' });
    }
    // Fetch comments for the confession and sort them by timestamp in descending order
    const comments = await Comment.find({ confessionId: id }).sort({ timestamps: -1 });

    // Attach the sorted comments to the confession object
    confession.comments = comments;

    res.status(200).json(confession);
  } catch (error) {
    console.error('Error fetching confession by ID:', error);
    res.status(500).json({ error: 'Unable to fetch confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
