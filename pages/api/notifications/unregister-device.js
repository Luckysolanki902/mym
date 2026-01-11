// API Route: Unregister Device from Push Notifications
// POST /api/notifications/unregister-device

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: token' 
      });
    }

    await connectDB();

    // Soft delete - mark as inactive instead of deleting
    const result = await DeviceToken.findOneAndUpdate(
      { token },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Device token not found' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Device unregistered successfully' 
    });

  } catch (error) {
    console.error('[Unregister Device] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
