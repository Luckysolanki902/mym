import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { email } = req.query;

  try {
    // Find personal replies where any reply's replierEmail matches the query email
    const personalReplies = await PersonalReply.find({ 
      "replies.replierEmail": email 
    }).sort({ timestamps: -1 });

    // Decrypt the replies and their secondary replies
    const decryptedReplies = personalReplies.map(reply => {
      let unseenMainCount = 0;
      const decryptedReply = {
        ...reply.toObject(),
        replies: reply.replies.filter(primary => primary.replierEmail === email).map(primary => {
          let unseenSecondaryCount = 0;
          const decryptedPrimary = {
            ...primary.toObject(),
            reply: CryptoJS.AES.decrypt(primary.reply, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8),
            secondaryReplies: primary.secondaryReplies.map(secondary => {
              const decryptedSecondary = {
                ...secondary.toObject(),
                content: CryptoJS.AES.decrypt(secondary.content, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8)
              };
              if (!secondary.seen.includes(email)) {
                unseenSecondaryCount++;
              }
              return decryptedSecondary;
            })
          };
          if (!primary.seen.includes(email)) {
            unseenMainCount++;
          }
          return decryptedPrimary;
        })
      };

      decryptedReply.unseenMainCount = unseenMainCount;
      decryptedReply.unseenSecondaryCount = decryptedReply.replies.reduce((acc, primary) => acc + primary.secondaryReplies.filter(sec => !sec.seen.includes(email)).length, 0);

      return decryptedReply;
    });

    res.status(200).json({ personalReplies: decryptedReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
