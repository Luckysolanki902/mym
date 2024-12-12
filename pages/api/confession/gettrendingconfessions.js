// pages/api/confession/gettrendingconfessions.js
import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';
import CryptoJS from 'crypto-js';

const MIN_CHAR_COUNT = 200; // Minimum length of confession content
const MAX_TRENDING_DAYS = [7, 30, 60, 90]; // Time windows for trending confessions
const MAX_TRENDING_ITEMS = 3; // Maximum number of trending confessions

const calculateTrendingConfessions = async () => {
  for (const days of MAX_TRENDING_DAYS) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const confessions = await Confession.aggregate([
      {
        $match: {
          createdAt: { $gte: sinceDate }, 
          $expr: { $gte: [{ $strLenCP: "$confessionContent" }, MIN_CHAR_COUNT] },
        },
      },
      {
        $addFields: {
          likesWeight: { $multiply: [{ $size: "$likes" }, 10] },
          commentsWeight: { $multiply: [{ $size: "$comments" }, 20] },
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] }, // Use 'createdAt'
              1000 * 60 * 60,
            ],
          },
          decayFactor: { $exp: { $multiply: [-0.1, { $divide: ["$ageInHours", 24] }] } },
          velocityScore: {
            $add: [
              { $multiply: [{ $divide: [{ $size: "$likes" }, { $add: ["$ageInHours", 1] }] }, 10] },
              { $multiply: [{ $divide: [{ $size: "$comments" }, { $add: ["$ageInHours", 1] }] }, 20] },
            ],
          },
        },
      },
      {
        $addFields: {
          totalScore: {
            $multiply: [
              { $add: ["$likesWeight", "$commentsWeight", "$velocityScore"] },
              "$decayFactor",
            ],
          },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: MAX_TRENDING_ITEMS },
    ]);

    if (confessions.length > 0) {
      return confessions;
    }
  }

  // Fallback: Return any confessions if no recent ones found
  return await Confession.aggregate([
    {
      $match: {
        $expr: { $gte: [{ $strLenCP: "$confessionContent" }, MIN_CHAR_COUNT] },
      },
    },
    {
      $addFields: {
        likesWeight: { $multiply: [{ $size: "$likes" }, 10] },
        commentsWeight: { $multiply: [{ $size: "$comments" }, 20] },
        ageInHours: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] }, // Use 'createdAt'
            1000 * 60 * 60,
          ],
        },
        decayFactor: { $exp: { $multiply: [-0.1, { $divide: ["$ageInHours", 24] }] } },
        velocityScore: {
          $add: [
            { $multiply: [{ $divide: [{ $size: "$likes" }, { $add: ["$ageInHours", 1] }] }, 10] },
            { $multiply: [{ $divide: [{ $size: "$comments" }, { $add: ["$ageInHours", 1] }] }, 20] },
          ],
        },
      },
    },
    {
      $addFields: {
        totalScore: {
          $multiply: [
            { $add: ["$likesWeight", "$commentsWeight", "$velocityScore"] },
            "$decayFactor",
          ],
        },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: MAX_TRENDING_ITEMS },
  ]);
};

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;

    // Fetch trending confessions
    const rawTrendingConfessions = await calculateTrendingConfessions();

    // Decrypt confessions
    const decryptedConfessions = rawTrendingConfessions.map((confession) => {
      const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
      const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
      confession.confessionContent = decryptedContent;
      return confession;
    });

    // Count total confessions in the database
    const totalConfessions = await Confession.countDocuments();

    res.status(200).json({ trendingConfessions: decryptedConfessions, totalConfessions });
  } catch (error) {
    console.error('Error fetching trending confessions:', error);
    res.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
};

export default connectToMongo(handler);
