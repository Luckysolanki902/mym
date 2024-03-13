import PersonalReply from '@/models/PersonalReply';
import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { email } = req.query;

  try {
    if (!email) {
      // If email is not provided in the query parameters, return a 400 Bad Request response
      return res.status(400).json({ error: 'Email parameter is missing' });
    }

    // Find personal replies for the given email
    const personalReplies = await PersonalReply.find({ confesserEmail: email });

    // If no personal replies are found, return a 404 Not Found response
    if (!personalReplies || personalReplies.length === 0) {
      return res.status(404).json({ error: `No personal replies found for the given email: ${email}` });
    }

    // Create a new array to store the formatted data
    const formattedReplies = [];

    // Manually populate confessionContent for each personal reply
    for (const reply of personalReplies) {
      try {
        const confession = await Confession.findById(reply.confessionId);
        let confessionContent = 'Confession content not available';
        if (confession) {
          confessionContent = confession.confessionContent;
        }
        // Create a new object with the required structure
        const formattedReply = {
          _id: reply._id,
          confessionId: reply.confessionId,
          confesserEmail: reply.confesserEmail,
          replies: reply.replies,
          timestamps: reply.timestamps,
          __v: reply.__v,
          confessionContent: confessionContent,
        };
        // Push the formatted reply to the new array
        formattedReplies.push(formattedReply);
      } catch (error) {
        console.error('Error fetching confession content:', error);
      }
    }

    // If personal replies are found, return a 200 OK response with the formatted data
    res.status(200).json({ personalReplies: formattedReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);

    // Return a 500 Internal Server Error response with detailed error information
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
