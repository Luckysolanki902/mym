// pages/api/inbox/get-replies-to-confessions.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { mid } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ENCRYPTION_SECRET_KEY) {
    console.error('ENCRYPTION_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Encryption key not configured' });
  }

  try {
    // Find personal replies for the given mid, sorted by createdAt descending
    const personalReplies = await PersonalReply.find({ confessorMid: mid }).sort({ createdAt: -1 });

    // Decrypt the replies and secondary replies
    const decryptedReplies = personalReplies.map(reply => {
      let unseenMainCount = 0;
      let decryptedConfessionContent = '';

      try {
        decryptedConfessionContent = CryptoJS.AES.decrypt(reply.confessionContent, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8);
        if (!decryptedConfessionContent) {
          console.warn(`Decryption failed for confessionId: ${reply.confessionId}`);
        }
      } catch (decryptionError) {
        console.error(`Error decrypting confessionContent for confessionId: ${reply.confessionId}`, decryptionError);
      }

      const decryptedReply = {
        ...reply.toObject(),
        confessionContent: decryptedConfessionContent,
        replies: reply.replies.map(primary => {
          let unseenSecondaryCount = 0;
          let decryptedPrimaryReply = '';

          try {
            decryptedPrimaryReply = CryptoJS.AES.decrypt(primary.reply, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8);
            if (!decryptedPrimaryReply) {
              console.warn(`Decryption failed for primary replyId: ${primary._id}`);
            }
          } catch (decryptionError) {
            console.error(`Error decrypting primary reply for replyId: ${primary._id}`, decryptionError);
          }

          const decryptedPrimary = {
            ...primary.toObject(),
            reply: decryptedPrimaryReply,
            secondaryReplies: primary.secondaryReplies.map(secondary => {
              let decryptedSecondaryContent = '';

              try {
                decryptedSecondaryContent = CryptoJS.AES.decrypt(secondary.content, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8);
                if (!decryptedSecondaryContent) {
                  console.warn(`Decryption failed for secondary replyId: ${secondary._id}`);
                }
              } catch (decryptionError) {
                console.error(`Error decrypting secondary reply for replyId: ${secondary._id}`, decryptionError);
              }

              if (!secondary.seen.includes(mid)) {
                unseenSecondaryCount++;
              }

              return {
                ...secondary.toObject(),
                content: decryptedSecondaryContent,
              };
            }),
          };

          if (!primary.seen.includes(mid)) {
            unseenMainCount++;
          }

          return decryptedPrimary;
        }),
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
