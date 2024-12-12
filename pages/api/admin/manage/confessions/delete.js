// pages/api/admin/manage/confessions/delete.js
import { getSession } from 'next-auth/react';
import Confession from '@/models/Confession';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {


  const { confessionId } = req.body;

  if (!confessionId) {
    return res.status(400).json({ error: 'Confession ID is required' });
  }

  try {
    // Delete the confession
    const confession = await Confession.findByIdAndDelete(confessionId);
    if (!confession) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    // Delete associated comments
    await Comment.deleteMany({ confessionId: confessionId });

    // Delete associated likes
    await Like.deleteMany({ confessionId: confessionId });

    // Delete associated personal replies
    await PersonalReply.deleteMany({ confessionId: confessionId });

    res.status(200).json({ message: 'Confession and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting confession:', error);
    res.status(500).json({ error: 'Unable to delete confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
