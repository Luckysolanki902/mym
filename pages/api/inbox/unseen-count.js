// pages/api/getdetails/unseen-count.js
import connectToMongo from '@/middleware/middleware';
import PersonalReply from '@/models/PersonalReply';

const handler = async (req, res) => {
  
  const { email } = req.query;

  try {
    // Find personal replies for the given email where seen is false
    const personalReplies = await PersonalReply.find({ confesserEmail: email, 'replies.seen': false });
    // Calculate unseen count by iterating through replies array
    let unseenCount = 0;
    personalReplies.forEach(reply => {
      unseenCount += reply.replies.filter(r => !r.seen).length;
    });
    res.status(200).json({ count: unseenCount });
  } catch (error) {
    console.error('Error fetching unseen count:', error);
    res.status(500).json({ error: 'Unable to fetch unseen count', detailedError: error.message });
  }
};

export default connectToMongo(handler);
