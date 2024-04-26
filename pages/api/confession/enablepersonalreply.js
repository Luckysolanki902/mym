// pages/api/confession/personalreply.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  
  const { confessionId, confesserEmail } = req.body;

  try {
    // Create a PersonalReply entry
    const personalReply = new PersonalReply({
      confessionId,
      confesserEmail,
    });

    await personalReply.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error creating PersonalReply entry:', error);
    res.status(500).json({ error: 'Unable to create PersonalReply entry', detailedError: error.message });
  }
};

export default connectToMongo(handler);
