import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { email } = req.query;
  console.log('email from api', email)

  try {
    // Find personal replies for the given email
    const personalReplies = await PersonalReply.find({ confesserEmail: email })
      .populate({
        path: 'confessionId',
        model: 'Confession',
        select: 'confessionContent',
      });
    console.log(personalReplies)
    res.status(200).json({ personalReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
