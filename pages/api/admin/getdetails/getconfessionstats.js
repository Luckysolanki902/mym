// pages/api/confession/stats.js
import Confession from '@/models/Confession';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  try {
    const totalConfessions = await Confession.countDocuments();
    const maleConfessions = await Confession.countDocuments({ gender: 'male' });
    const femaleConfessions = await Confession.countDocuments({ gender: 'female' });

    const totalComments = await Comment.countDocuments();
    const maleComments = await Comment.countDocuments({ gender: 'male' });
    const femaleComments = await Comment.countDocuments({ gender: 'female' });

    const totalLikes = await Like.countDocuments();
    const totalReplies = await PersonalReply.aggregate([
      { $unwind: '$replies' },
      { $count: 'totalReplies' }
    ]);
    const totalPersonalReplies = totalReplies.length > 0 ? totalReplies[0].totalReplies : 0;

    res.status(200).json({
      totalConfessions,
      maleConfessions,
      femaleConfessions,
      totalComments,
      maleComments,
      femaleComments,
      totalLikes,
      totalPersonalReplies
    });
  } catch (error) {
    console.error('Error fetching confession stats:', error);
    res.status(500).json({ error: 'Unable to fetch confession stats', detailedError: error.message });
  }
};

export default connectToMongo(handler);
