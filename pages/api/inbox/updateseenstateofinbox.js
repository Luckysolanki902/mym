import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { id } = req.body;

  console.log("Request body:", req.body);

  try {
    const personalReply = await PersonalReply.findById(id);
    console.log("Personal Reply found:", personalReply);

    if (!personalReply) {
      console.log("Personal Reply not found.");
      return res.status(404).json({ error: 'Personal reply not found' });
    }

    // Mark all replies as seen
    personalReply.replies.forEach(reply => {
      reply.seen = true;
    });

    console.log("Updated Personal Reply:", personalReply);

    await personalReply.save();

    console.log("Replies updated to seen.");
    res.status(200).json({ message: 'Replies updated to seen' });
  } catch (error) {
    console.error('Error updating seen state of replies:', error);
    res.status(500).json({ error: 'Unable to update seen state of replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
