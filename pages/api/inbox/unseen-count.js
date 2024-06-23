import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const countUnseenHandler = async (req, res) => {
  const { email } = req.query;

  try {
    // Find personal replies for the given email
    const personalReplies = await PersonalReply.find({ confessorEmail: email }).sort({ timestamps: -1 });

    // Calculate total unseen counts
    let totalUnseenCount1 = 0;
    let totalUnseenCount2 = 0;

    // Iterate through personal replies to count unseen replies
    personalReplies.forEach(reply => {
      reply.replies.forEach(primary => {
        if (!primary.seen.includes(email)) {
          totalUnseenCount1++;
        }
        if (primary.replierEmail === email && !primary.seen.includes(email)) {
          totalUnseenCount2++;
        }

        primary.secondaryReplies.forEach(secondary => {
          if (!secondary.seen.includes(email)) {
            totalUnseenCount1++;
          }
          if (secondary.replierEmail === email && !secondary.seen.includes(email)) {
            totalUnseenCount2++;
          }
        });
      });
    });

    res.status(200).json({ totalUnseenCount1, totalUnseenCount2 });
  } catch (error) {
    console.error('Error counting unseen replies:', error);
    res.status(500).json({ error: 'Unable to count unseen replies', detailedError: error.message });
  }
};

export default connectToMongo(countUnseenHandler);
