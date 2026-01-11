// API Route: Register Device for Push Notifications
// POST /api/notifications/register-device

import mongoose from 'mongoose';
import DeviceToken from '@/models/DeviceToken';

// Database connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, token, platform, deviceInfo } = req.body;

    if (!userId || !token || !platform) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, token, platform' 
      });
    }

    // Validate platform
    if (!['android', 'ios', 'web'].includes(platform)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid platform. Must be android, ios, or web' 
      });
    }

    // Connect to database
    await connectDB();

    // Check if token already exists
    const existingToken = await DeviceToken.findOne({ token });

    if (existingToken) {
      // Update existing token
      existingToken.userId = userId;
      existingToken.platform = platform;
      existingToken.deviceInfo = deviceInfo || {};
      existingToken.isActive = true;
      existingToken.lastUsed = new Date();
      await existingToken.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Device token updated',
        tokenId: existingToken._id,
      });
    }

    // Create new token record
    const newToken = new DeviceToken({
      userId,
      token,
      platform,
      deviceInfo: deviceInfo || {},
      isActive: true,
      lastUsed: new Date(),
    });

    await newToken.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Device registered successfully',
      tokenId: newToken._id,
    });

  } catch (error) {
    console.error('[Register Device] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
