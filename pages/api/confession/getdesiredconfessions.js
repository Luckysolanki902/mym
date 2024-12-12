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
  const page = parseInt(req.query.page) || 1; // Parse the page parameter
  const perPage = 10; // Number of confessions per page
  const skip = (page - 1) * perPage;

  const query = {};

  if (college) {
    if (college === 'yourCollege') {
      query.college = req.query.userCollege;
    } else if (college === 'otherColleges') {
      query.college = { $ne: req.query.userCollege };
    }
  }

  if (gender && gender !== 'any') {
    query.gender = gender;
  }

  try {
    // Fetch confessions with pagination and filtering, sorted by createdAt descending
    const confessions = await Confession.find(query)
      .sort({ createdAt: -1 })
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
