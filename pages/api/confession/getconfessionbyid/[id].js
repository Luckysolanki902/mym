// pages/api/confession/getconfessionbyid/[id].js
import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';
import Comment from '@/models/Comment';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { id } = req.query;

  try {
    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    // Decrypt the confession content
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
    const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
    confession.confessionContent = decryptedContent;

    // Fetch comments for the confession and sort them by createdAt in descending order
    const comments = await Comment.find({ confessionId: id }).sort({ createdAt: -1 });

    // Decrypt comments and their replies
    const decryptedComments = comments.map(comment => {
      const decryptedCommentContent = CryptoJS.AES.decrypt(comment.commentContent, secretKeyHex).toString(CryptoJS.enc.Utf8);
      
      const decryptedReplies = comment.replies.map(reply => {
        const decryptedReplyContent = CryptoJS.AES.decrypt(reply.replyContent, secretKeyHex).toString(CryptoJS.enc.Utf8);
        return {
          ...reply.toObject(),
          replyContent: decryptedReplyContent,
        };
      });

      return {
        ...comment.toObject(),
        commentContent: decryptedCommentContent,
        replies: decryptedReplies,
      };
    });

    // Attach the sorted and decrypted comments to the confession object
    const confessionObject = confession.toObject();
    confessionObject.comments = decryptedComments;

    res.status(200).json(confessionObject);
  } catch (error) {
    console.error('Error fetching confession by ID:', error);
    res.status(500).json({ error: 'Unable to fetch confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
