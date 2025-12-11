// pages/api/confession/getdesiredconfessions.js

import CryptoJS from 'crypto-js';
import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const college = req.query.college || '';
  const gender = req.query.gender || '';
  const sortBy = req.query.sortBy || 'new';
  const myCollegeOnly = req.query.myCollegeOnly === 'true';
  const userCollege = req.query.userCollege || '';
  const page = parseInt(req.query.page) || 1; // Parse the page parameter
  const perPage = 10; // Number of confessions per page
  const skip = (page - 1) * perPage;

  const query = {};

  // My College filter takes priority if enabled
  if (myCollegeOnly && userCollege) {
    query.college = userCollege;
  } else if (college && college !== 'all') {
    if (college === 'yourCollege') {
      query.college = userCollege;
    } else if (college === 'otherColleges') {
      query.college = { $ne: userCollege };
    } else {
      query.college = college;
    }
  }

  if (gender && gender !== 'any') {
    query.gender = gender;
  }

  try {
    const matchStage = { $match: query };
    const engagementStage = {
      $addFields: {
        likesCount: { $size: { $ifNull: ['$likes', []] } },
        commentsCount: { $size: { $ifNull: ['$comments', []] } },
      },
    };
    const scoreStage = {
      $addFields: {
        engagementScore: {
          $add: [
            { $ifNull: ['$likesCount', 0] },
            { $ifNull: ['$commentsCount', 0] },
          ],
        },
      },
    };

    const sortStage =
      sortBy === 'trending'
        ? { $sort: { engagementScore: -1, createdAt: -1 } }
        : { $sort: { createdAt: -1 } };

    const pipeline = [matchStage, engagementStage, scoreStage, sortStage, { $skip: skip }, { $limit: perPage }];

    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const confessions = await Confession.aggregate(pipeline);

    const decryptedConfessions = confessions.map(confession => {
      const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
      const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
      const { engagementScore, likesCount, commentsCount, ...rest } = confession;
      return {
        ...rest,
        confessionContent: decryptedContent,
      };
    });

    res.status(200).json({ confessions: decryptedConfessions });
  } catch (error) {
    console.error('Error fetching confessions:', error);
    res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
  }
};

export default connectToMongo(handler);
