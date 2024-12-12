// pages/api/confession/saveanonymoussecondaryreplies.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    confessionId,
    confessorMid,
    replierMid,
    secondaryReplyContent,
    sentByConfessor,
    replierGender,
    userMid,
  } = req.body;

  try {
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;

    // Find the PersonalReply entry for the confessor
    const personalReply = await PersonalReply.findOne({
      confessionId,
      confessorMid,
    });

    if (!personalReply) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    // Find the specific primary reply based on the replier's mid
    const primaryReply = personalReply.replies.find(reply => reply.replierMid === replierMid);

    if (!primaryReply) {
      return res.status(404).json({ error: 'Primary reply not found' });
    }

    // Encrypt the secondary reply content
    const encryptedReplyContent = CryptoJS.AES.encrypt(secondaryReplyContent, secretKeyHex).toString();

    // Add the secondary reply to the primary reply
    primaryReply.secondaryReplies.push({
      content: encryptedReplyContent,
      sentBy: userMid,
      sentByConfessor: sentByConfessor,
      replierGender,
      seen: [userMid], // Initialize the seen array with the user mid
    });

    // Save the updated entry
    await personalReply.save();

    res.status(201).json({ success: true, message: 'Secondary reply saved successfully' });
  } catch (error) {
    console.error('Error saving secondary reply:', error);
    res.status(500).json({ error: 'Unable to save secondary reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
