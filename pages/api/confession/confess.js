import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  const { mid, college, gender, confessionContent } = req.body;
  try {
    // Your secret key from environment variables
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const secretKey = Buffer.from(secretKeyHex, 'hex');

    // Generate a random IV for mid encryption
    const iv = crypto.randomBytes(16);

    // Encrypt the mid using crypto and your secret key with a random IV
    const algorithm = 'aes-256-cbc';
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encryptedMid = cipher.update(mid, 'utf-8', 'hex');
    encryptedMid += cipher.final('hex');

    // Encrypt the confession content using CryptoJS
    const encryptedConfessionContent = CryptoJS.AES.encrypt(confessionContent, secretKeyHex).toString();

    const newConfession = new Confession({
      encryptedMid,
      college,
      gender,
      confessionContent: encryptedConfessionContent,
      iv: iv.toString('hex'), // Store the IV along with the mid ciphertext
    });

    const savedConfession = await newConfession.save();
    res.status(201).json({ message: 'Confession stored successfully', confessionId: savedConfession._id });
  } catch (error) {
    console.error('Error storing confession:', error);
    res.status(500).json({ error: 'Unable to store confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
