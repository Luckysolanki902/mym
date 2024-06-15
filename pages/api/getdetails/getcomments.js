// pages/api/comment/getcomments.js

import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import Comment from '@/models/Comment';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { confessionId } = req.query;

  try {
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;

    if (!secretKeyHex) {
      throw new Error('Encryption secret key is not defined in environment variables');
    }

    const comments = await Comment.find({ confessionId }).sort({ timestamps: -1 });

    // Decrypt commentContent and replyContent
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

    res.status(200).json({ comments: decryptedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Unable to fetch comments', detailedError: error.message });
  }
};

export default connectToMongo(handler);
