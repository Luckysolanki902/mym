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
  const page = parseInt(req.query.page) || 1; // Parse the page parameter
  const perPage = 10; // Number of confessions per page
  const skip = (page - 1) * perPage;

  const query = {};

  if (college && college !== 'all') {
    if (college === 'yourCollege') {
      query.college = req.query.userCollege;
    } else if (college === 'otherColleges') {
      query.college = { $ne: req.query.userCollege };
    } else {
      query.college = college;
    }
  }

  if (gender && gender !== 'any') {
    query.gender = gender;
  }

  try {
    // Determine sort order based on sortBy parameter
    let sortOption = {};
    if (sortBy === 'trending') {
      // Sort by number of likes + comments (engagement)
      sortOption = { createdAt: -1 }; // Will aggregate after fetch
    } else {
      // Default to 'new' - sort by creation date
      sortOption = { createdAt: -1 };
    }

    // Fetch confessions with pagination and filtering
    let confessions = await Confession.find(query)
      .populate('likes')
      .populate('comments')
      .sort(sortOption)
      .skip(skip)
      .limit(sortBy === 'trending' ? perPage * 3 : perPage); // Fetch more for trending to sort properly

    // If trending, sort by engagement
    if (sortBy === 'trending') {
      confessions = confessions
        .map(conf => ({
          ...conf.toObject(),
          engagement: (conf.likes?.length || 0) + (conf.comments?.length || 0)
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, perPage);
    }

    confessions = await Confession.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    // Decrypt the confession content
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const decryptedConfessions = confessions.map(confession => {
      const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
      const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
      return {
        ...confession.toObject(),
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
