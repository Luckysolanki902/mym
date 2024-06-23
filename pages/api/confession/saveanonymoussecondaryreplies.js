// pages/api/confession/saveanonymoussecondaryreplies.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  const { 
    confessionId,
    confessorEmail,
    replierEmail,
    secondaryReplyContent,
    sentByConfessor,
    replierGender ,
    userEmail,
  } = req.body;


  try {
    // Find the PersonalReply entry for the confessor
    const personalReply = await PersonalReply.findOne({
      confessionId,
      confessorEmail,
    });

    if (!personalReply) {
      return res.status(404).json({ error: 'Confession not found' });
    }

    // Find the specific primary reply based on the replier's email
    const primaryReply = personalReply.replies.find(reply => reply.replierEmail === replierEmail);

    if (!primaryReply) {
      return res.status(404).json({ error: 'Primary reply not found' });
    }

    const encryptedReplyContent = CryptoJS.AES.encrypt(secondaryReplyContent, process.env.ENCRYPTION_SECRET_KEY).toString();

    // Add the secondary reply to the primary reply
    primaryReply.secondaryReplies.push({
      content: encryptedReplyContent,
      sentBy: userEmail,
      sentByConfessor: sentByConfessor,
      replierGender,
      seen: [userEmail], // Initialize the seen array with the replier email
    });

    // Save the updated entry
    await personalReply.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving secondary reply:', error);
    res.status(500).json({ error: 'Unable to save secondary reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
