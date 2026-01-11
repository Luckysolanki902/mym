// API Route: Get Push Notification Statistics
// GET /api/notifications/stats

import mongoose from 'mongoose';
import DeviceToken from '@/models/DeviceToken';

// Database connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const [totalDevices, androidDevices, iosDevices, webDevices] = await Promise.all([
      DeviceToken.countDocuments({ isActive: true }),
      DeviceToken.countDocuments({ isActive: true, platform: 'android' }),
      DeviceToken.countDocuments({ isActive: true, platform: 'ios' }),
      DeviceToken.countDocuments({ isActive: true, platform: 'web' }),
    ]);

    // Get recent registrations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRegistrations = await DeviceToken.countDocuments({
      createdAt: { $gte: oneDayAgo },
    });

    // Get active in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeLastWeek = await DeviceToken.countDocuments({
      lastUsed: { $gte: sevenDaysAgo },
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalDevices,
        byPlatform: {
          android: androidDevices,
          ios: iosDevices,
          web: webDevices,
        },
        recentRegistrations,
        activeLastWeek,
      },
    });
  } catch (error) {
    console.error('[Notification Stats] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
