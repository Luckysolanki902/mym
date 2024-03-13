import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { email } = req.query;
  console.log('email from api', email)

  try {
    if (!email) {
      // If email is not provided in the query parameters, return a 400 Bad Request response
      return res.status(400).json({ error: 'Email parameter is missing' });
    }

    // Find personal replies for the given email
    const personalReplies = await PersonalReply.find({ confesserEmail: email })
      .populate({
        path: 'confessionId',
        model: 'Confession',
        select: 'confessionContent',
      });

    // If no personal replies are found, return a 404 Not Found response
    if (!personalReplies || personalReplies.length === 0) {
      return res.status(404).json({ error: `No personal replies found for the given email: ${email}` });
    }

    console.log(personalReplies);
    
    // If personal replies are found, return a 200 OK response with the data
    res.status(200).json({ personalReplies });
  } catch (error) {
    console.error('Error fetching personal replies:', error);

    // Return a 500 Internal Server Error response with detailed error information
    res.status(500).json({ error: 'Unable to fetch personal replies', detailedError: error.message });
  }
};

export default connectToMongo(handler);
