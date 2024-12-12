// pages/api/inbox/get-replies-to-replies.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { mid } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!mid) {
    return res.status(400).json({ error: 'Missing mid parameter' });
  }

  try {
    // Find personal replies where any reply's replierMid matches the query mid
    // and exclude confessions authored by the user
    const personalReplies = await PersonalReply.find({
      'replies.replierMid': mid,
      confessorMid: { $ne: mid }, // Exclude user's own confessions
    }).sort({ createdAt: -1 });

    // Decrypt the replies and their secondary replies
    const decryptedReplies = personalReplies.map((reply) => {
      let unseenMainCount = 0;
      let unseenSecondaryCount = 0;

      const decryptedConfessionContent = CryptoJS.AES.decrypt(
        reply.confessionContent,
        process.env.ENCRYPTION_SECRET_KEY
      ).toString(CryptoJS.enc.Utf8);

      // Filter replies where replierMid matches the query mid
      const filteredReplies = reply.replies.filter((primary) => primary.replierMid === mid);

      const decryptedFilteredReplies = filteredReplies.map((primary) => {
        const decryptedPrimaryReply = CryptoJS.AES.decrypt(primary.reply, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8);

        const decryptedSecondaryReplies = primary.secondaryReplies.map((secondary) => {
          const decryptedSecondaryContent = CryptoJS.AES.decrypt(
            secondary.content,
            process.env.ENCRYPTION_SECRET_KEY
          ).toString(CryptoJS.enc.Utf8);

          if (!secondary.seen.includes(mid)) {
            unseenSecondaryCount++;
          }

          return {
            ...secondary.toObject(),
            content: decryptedSecondaryContent,
          };
        });

        if (!primary.seen.includes(mid)) {
          unseenMainCount++;
        }

        return {
          ...primary.toObject(),
          reply: decryptedPrimaryReply,
          secondaryReplies: decryptedSecondaryReplies,
        };
      });

      return {
        ...reply.toObject(),
        confessionContent: decryptedConfessionContent,
        replies: decryptedFilteredReplies,
        unseenMainCount,
        unseenSecondaryCount,
      };
    });

    res.status(200).json({ personalReplies: decryptedReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
