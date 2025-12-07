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

    // --- Notification Logic (Async, Non-blocking) ---
    (async () => {
        try {
            console.log('[Notification Debug] 🚀 Starting Broadcast Notification Process...');
            const { sendNotification, NOTIFICATION_TYPES } = await import('@/utils/emailService');
            const { getNewConfessionBroadcastTemplate } = await import('@/utils/emailTemplates/newConfessionBroadcast');
            const User = (await import('@/models/User')).default;
            
            // --- SIMULATION LOGIC FOR PRODUCTION ---
            // Calculate who WOULD receive this in production
            // Assuming broadcast goes to all verified users or users from the same college
            const potentialRecipientsCount = await User.countDocuments({ isVerified: true });
            const sampleRecipients = await User.find({ isVerified: true }).select('email').limit(3).lean();
            const sampleEmails = sampleRecipients.map(u => u.email);

            console.log(`[Notification Debug] 📢 BROADCAST SIMULATION INFO:`);
            console.log(`[Notification Debug] ----------------------------------------`);
            console.log(`[Notification Debug] 🎯 Target Audience: All Verified Users`);
            console.log(`[Notification Debug] 📊 Total Potential Recipients: ${potentialRecipientsCount}`);
            console.log(`[Notification Debug] 🔍 Sample Recipients: ${sampleEmails.join(', ')}`);
            console.log(`[Notification Debug] ----------------------------------------`);

            // --- PRODUCTION BROADCAST LOGIC (Via Node Server) ---
            // Offload the broadcast task to the persistent Node.js server
            const serverUrl = `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/broadcast-confession`;
            
            console.log(`[Notification Debug] 🚀 Offloading Broadcast to Server: ${serverUrl}`);
            
            // Fire and forget
            fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confessionId: savedConfession._id,
                    college,
                    gender,
                    confessionContent,
                    secret: process.env.NEXT_PUBLIC_SECRET_KEY
                })
            }).catch(err => console.error('[Notification Debug] ❌ Failed to trigger broadcast on server:', err));

            console.log('[Notification Debug] ✅ Broadcast Request Sent to Server');

        } catch (err) {
            console.error('[Notification Debug] ❌ Notification Error (Broadcast):', err);
        }
    })();
    // ------------------------------------------------
  } catch (error) {
    console.error('Error storing confession:', error);
    res.status(500).json({ error: 'Unable to store confession', detailedError: error.message });
  }
};

export default connectToMongo(handler);
