import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const countUnseenHandler = async (req, res) => {
  const { mid } = req.query;
  try {
    // Find personal replies for the given mid
    const personalReplies = await PersonalReply.find({ confessorMid: mid }).sort({ timestamps: -1 });

    // Calculate total unseen counts
    let totalUnseenCount1 = 0;
    let totalUnseenCount2 = 0;

    // Iterate through personal replies to count unseen replies
    personalReplies.forEach(reply => {
      reply.replies.forEach(primary => {
        if (!primary.seen.includes(mid)) {
          totalUnseenCount1++;
        }
        if (primary.replierMid === mid && !primary.seen.includes(mid)) {
          totalUnseenCount2++;
        }

        primary.secondaryReplies.forEach(secondary => {
          if (!secondary.seen.includes(mid)) {
            totalUnseenCount1++;
          }
          if (secondary.replierMid === mid && !secondary.seen.includes(mid)) {
            totalUnseenCount2++;
          }
        });
      });
    });


    const personalReplies2 = await PersonalReply.find({ 
      "replies.replierMid": mid 
    }).sort({ timestamps: -1 });

    let totalUnseenCount3 = 0;
    let totalUnseenCount4 = 0;

    personalReplies2.map(mainreply =>{
      mainreply.replies.filter(primary => primary.replierMid === mid).map(primary =>{
        primary.secondaryReplies.map(secondary => {
          if(!secondary.seen.includes(mid)){
            totalUnseenCount3++
          }
        })
      })
    })

    



    res.status(200).json({ totalUnseenCount1: totalUnseenCount1 + totalUnseenCount2, totalUnseenCount2: totalUnseenCount3 + totalUnseenCount4 });
  } catch (error) {
    console.error('Error counting unseen replies:', error);
    res.status(500).json({ error: 'Unable to count unseen replies', detailedError: error.message });
  }
};

export default connectToMongo(countUnseenHandler);
