import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';

const handler = async (req, res) => {
  const { usercollege } = req.query;

  try {
    // Assuming usercollege is provided in the query parameter
    if (!usercollege) {
      return res.status(400).json({ error: 'Missing usercollege parameter' });
    }

    // Find confessions for the specified college and populate likes and comments
    const confessions = await Confession.find({ college: usercollege });

    // Calculate a score for each confession based on weights for likes, comments, and timestamps
    const weightedConfessions = confessions.map((confession) => {
      const likesWeight = confession.likes.length * 2; // Increase the weight for likes
      const commentsWeight = confession.comments.length;
      const timestampsWeight = calculateTimestampWeight(confession.timestamps);

      const score = likesWeight + commentsWeight + timestampsWeight;
      console.log(`likes: ${likesWeight}, comments: ${commentsWeight}, timeWeight: ${timestampsWeight}, and final score is: ${score}`)
      return { confession, score };
    });

    // Sort confessions based on the calculated score in descending order
    const trendingConfessions = weightedConfessions
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(5, confessions.length)) // Ensure at least 5 confessions, even if older ones
      .map((weightedConfession) => weightedConfession.confession);

    res.status(200).json({ trendingConfessions });
  } catch (error) {
    console.error('Error fetching trending confessions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to calculate timestamp weight based on the age of the confession
const calculateTimestampWeight = (timestamp) => {
  const confessionAgeInDays = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24); // Convert milliseconds to days

  // Adjust the weights based on your preference and requirements
  const MAX_AGE_IN_DAYS = 30; // Maximum age to consider for timestamps
  const timestampWeight = Math.max(0, 1 - confessionAgeInDays / MAX_AGE_IN_DAYS); // Higher weight for newer confessions, but not negative

  return timestampWeight;
};

export default connectToMongo(handler);
