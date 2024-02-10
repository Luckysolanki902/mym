import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';

const calculateTimestampWeight = (timestamp) => {
  const confessionAgeInDays = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
  const MAX_AGE_IN_DAYS = 30;
  const timestampWeight = Math.max(0, 1 - confessionAgeInDays / MAX_AGE_IN_DAYS) * 5;
  return timestampWeight;
};

const calculateConfessionScore = (confession) => {
  const likesWeight = confession.likes.length * 10;
  const commentsWeight = confession.comments.length * 20;
  const timestampsWeight = calculateTimestampWeight(confession.timestamps);
  return likesWeight + commentsWeight + timestampsWeight;
};

const getTrendingConfessions = (confessions) => {
  const weightedConfessions = confessions.map((confession) => {
    const score = calculateConfessionScore(confession);
    return { confession, score };
  });

  const trendingConfessions = weightedConfessions
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(5, confessions.length));

  return trendingConfessions.map((weightedConfession) => weightedConfession.confession);
};

const handler = async (req, res) => {
  try {
    const confessions = await Confession.find();
    const trendingConfessions = getTrendingConfessions(confessions);
    res.status(200).json({ trendingConfessions });
  } catch (error) {
    console.error('Error fetching trending confessions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default connectToMongo(handler);
