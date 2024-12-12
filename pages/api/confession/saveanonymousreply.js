// pages/api/confession/saveanonymousreply.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confessionId, encryptedConfessorMid, confessorGender, confessionContent, iv, replyContent, userMid } = req.body;

  try {
    // Your secret key from environment variables
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const secretKey = Buffer.from(secretKeyHex, 'hex');

    // Decrypt the encryptedConfessorMid using crypto
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let decryptedMid = decipher.update(encryptedConfessorMid, 'hex', 'utf-8');
    decryptedMid += decipher.final('utf-8');

    // Encrypt the confessionContent using CryptoJS
    const encryptedConfessionContent = CryptoJS.AES.encrypt(confessionContent, secretKeyHex).toString();

    // Find the PersonalReply entry for the confessor
    let personalReply = await PersonalReply.findOne({
      confessionId,
      confessorMid: decryptedMid,
    });

    if (!personalReply) {
      // If no entry exists, create a new one with encrypted confessionContent
      personalReply = new PersonalReply({
        confessionId,
        confessorMid: decryptedMid,
        confessionContent: encryptedConfessionContent,
        confessorGender,
      });
    }

    // Encrypt the reply content
    const encryptedReplyContent = CryptoJS.AES.encrypt(replyContent.reply, secretKeyHex).toString();

    // Check if the replier has already replied
    const existingReplyIndex = personalReply.replies.findIndex(
      (reply) => reply.replierMid === replyContent.replierMid
    );

    if (existingReplyIndex > -1) {
      // If the replier has already replied, add the new reply as a secondary reply
      personalReply.replies[existingReplyIndex].secondaryReplies.push({
        content: encryptedReplyContent,
        sentBy: replyContent.replierMid,
        sentByConfessor: decryptedMid === userMid,
        replierGender: replyContent.replierGender,
        seen: [replyContent.replierMid], // Push the replier mid into seen
      });
    } else {
      // Add the reply to the array
      personalReply.replies.push({
        reply: encryptedReplyContent,
        replierMid: replyContent.replierMid,
        replierGender: replyContent.replierGender,
        seen: [replyContent.replierMid], // Initialize the seen array with replier mid
      });
    }

    // Save the updated entry
    await personalReply.save();

    res.status(201).json({ success: true, message: 'Anonymous reply saved successfully' });
  } catch (error) {
    console.error('Error saving anonymous reply:', error);
    res.status(500).json({ error: 'Unable to save anonymous reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
