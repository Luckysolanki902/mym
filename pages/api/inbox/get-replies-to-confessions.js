import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { mid } = req.query;
  
  try {
    // Find personal replies for the given mid
    const personalReplies = await PersonalReply.find({ confessorMid: mid }).sort({ timestamps: -1 });

    // Decrypt the replies and secondary replies
    const decryptedReplies = personalReplies.map(reply => {
      let unseenMainCount = 0;
      const decryptedReply = {
        ...reply.toObject(),
        replies: reply.replies.map(primary => {
          let unseenSecondaryCount = 0;
          const decryptedPrimary = {
            ...primary.toObject(),
            reply: CryptoJS.AES.decrypt(primary.reply, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            secondaryReplies: primary.secondaryReplies.map(secondary => {
              const decryptedSecondary = {
                ...secondary.toObject(),
                content: CryptoJS.AES.decrypt(secondary.content, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8)
              };
              if (!secondary.seen.includes(mid)) {
                unseenSecondaryCount++;
              }
              return decryptedSecondary;
            })
          };
          if (!primary.seen.includes(mid)) {
            unseenMainCount++;
          }
          return decryptedPrimary;
        })
      };

      decryptedReply.unseenMainCount = unseenMainCount;
      decryptedReply.unseenSecondaryCount = decryptedReply.replies.reduce((acc, primary) => acc + primary.secondaryReplies.filter(sec => !sec.seen.includes(mid)).length, 0);

      return decryptedReply;
    });

    res.status(200).json({ personalReplies: decryptedReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
