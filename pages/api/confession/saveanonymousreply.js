// pages/api/confession/saveanonymousreply.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { confessionId, encryptedMid, confessorGender, confessionContent, iv, replyContent } = req.body;

  try {
    // Decrypt the encrypted email using the secret key from .env
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedMid = decipher.update(encryptedMid, 'hex', 'utf-8');
    decryptedMid += decipher.final('utf-8');

    // Find the PersonalReply entry for the confessor
    let personalReply = await PersonalReply.findOne({
      confessionId,
      confessorMid: decryptedMid,
    });

    if (!personalReply) {
      // If no entry exists, create a new one
      personalReply = new PersonalReply({
        confessionId,
        confessorMid: decryptedMid,
        confessionContent,
        confessorGender,
      });
    }

    // Check if the replier has already replied
    const existingReplyIndex = personalReply.replies.findIndex(
      (reply) => reply.replierMid === replyContent.replierMid
    );

    const encryptedReplyContent = CryptoJS.AES.encrypt(replyContent.reply, secretKey).toString();

    if (existingReplyIndex > -1) {
      // If the replier has already replied, add the new reply as a secondary reply
      personalReply.replies[existingReplyIndex].secondaryReplies.push({
        content: encryptedReplyContent,
        sentBy: replyContent.replierMid,
        sentByConfessor: false,
        replierGender: replyContent.replierGender,
        seen: [replyContent.replierMid], // Push the replier email into seen
      });
    } else {
      // Add the reply to the array
      personalReply.replies.push({
        ...replyContent,
        reply: encryptedReplyContent,
        seen: [replyContent.replierMid], // Initialize the seen array with replier email
      });
    }

    // Save the updated entry
    await personalReply.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving anonymous reply:', error);
    res.status(500).json({ error: 'Unable to save anonymous reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
