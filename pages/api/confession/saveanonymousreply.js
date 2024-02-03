// pages/api/confession/saveanonymousreply.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import crypto from 'crypto';

const handler = async (req, res) => {
  const { confessionId, encryptedEmail, iv, replyContent } = req.body;

  try {
    // Decrypt the encrypted email using the secret key from .env
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf-8');
    decryptedEmail += decipher.final('utf-8');

    // Find the PersonalReply entry for the confessor
    let personalReply = await PersonalReply.findOne({
      confessionId,
      confesserEmail: decryptedEmail,
    });

    if (!personalReply) {
      // If no entry exists, create a new one
      personalReply = new PersonalReply({
        confessionId,
        confesserEmail: decryptedEmail,
      });
    }

    // Add the reply to the array
    personalReply.replies.push(replyContent);

    // Save the updated entry
    await personalReply.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving anonymous reply:', error);
    res.status(500).json({ error: 'Unable to save anonymous reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
