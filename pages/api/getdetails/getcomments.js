import Comment from '@/models/Comment';
import connectToMongo from '@/middleware/middleware';
import { getSession } from 'next-auth/react';

const handler = async (req, res) => {
  // Check if user is authenticated
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { confessionId } = req.query;

  try {
    const comments = await Comment.find({ confessionId }).sort({ timestamps: -1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Unable to fetch comments', detailedError: error.message });
  }
};

export default connectToMongo(handler);
