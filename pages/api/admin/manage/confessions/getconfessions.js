// pages/api/admin/manage/confessions/getconfessions.js
import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // TODO: Implement authentication and authorization to ensure only admins can access

  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  try {
    const confessions = await Confession.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    // Decrypt confession content
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const decryptedConfessions = confessions.map(confession => {
      const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
      const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
      return {
        ...confession.toObject(),
        confessionContent: decryptedContent,
      };
    });

    const totalConfessions = await Confession.countDocuments({});

    res.status(200).json({
      confessions: decryptedConfessions,
      totalPages: Math.ceil(totalConfessions / perPage),
    });
  } catch (error) {
    console.error('Error fetching confessions:', error);
    res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
  }
};

export default connectToMongo(handler);
