// pages/api/confession/gettrendingconfessions.js

import connectToMongo from '@/middleware/middleware';
import Confession from '@/models/Confession';
import CryptoJS from 'crypto-js';

const MIN_CHAR_COUNT = 200;   // Minimum length of confession content
const MAX_TRENDING_ITEMS = 3; // Always exactly 3 confessions

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // 1. Define an aggregation pipeline that computes a "fair" score
    //    using alpha=2 for likes and beta=1 for comments, plus time decay.
    const trendingConfessions = await Confession.aggregate([
      {
        // Only consider confessions with content >= MIN_CHAR_COUNT
        $match: {
          $expr: { $gte: [{ $strLenCP: "$confessionContent" }, MIN_CHAR_COUNT] },
        },
      },
      {
        // Calculate:
        //  - likesCount    = size of likes array
        //  - commentsCount = size of comments array
        //  - engagementScore = (2 * likesCount) + (1 * commentsCount)
        //  - ageInHours    = (now - createdAt) in hours
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          engagementScore: {
            $add: [
              { $multiply: [2, { $size: "$likes" }] },
              { $multiply: [1, { $size: "$comments" }] }
            ]
          },
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60
            ]
          }
        },
      },
      {
        // Implement the time decay factor:
        //   timeDecay = 1 / (1 + ((ageInHours / 24)^2))
        // Then combine to get totalScore = engagementScore * timeDecay
        $addFields: {
          timeDecay: {
            $divide: [
              1,
              {
                $add: [
                  1,
                  {
                    $pow: [
                      { $divide: ["$ageInHours", 24] }, 
                      2
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          totalScore: { $multiply: ["$engagementScore", "$timeDecay"] },
        },
      },
      {
        // Sort highest scoring first
        $sort: { totalScore: -1 },
      },
      {
        // Return exactly 3
        $limit: MAX_TRENDING_ITEMS,
      },
    ]);

    // 2. Decrypt the confession contents
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const decryptedConfessions = trendingConfessions.map((confession) => {
      const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
      const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
      confession.confessionContent = decryptedContent;
      return confession;
    });

    // 3. Count total confessions in the database (for reference/stats)
    const totalConfessions = await Confession.countDocuments();

    // 4. Send the response
    res.status(200).json({
      trendingConfessions: decryptedConfessions,
      totalConfessions
    });
  } catch (error) {
    console.error('Error fetching trending confessions:', error);
    res.status(500).json({ error: 'Internal Server Error', detailedError: error.message });
  }
};

export default connectToMongo(handler);
