// API Route: Send Push Notification (Admin)
// POST /api/notifications/send

import mongoose from 'mongoose';
import DeviceToken from '@/models/DeviceToken';
import admin from 'firebase-admin';

// Database connection helper
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Initialize Firebase Admin (singleton)
let firebaseInitialized = false;
const initFirebase = () => {
  if (firebaseInitialized || admin.apps.length > 0) {
    firebaseInitialized = true;
    return;
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('[Send Notification] Firebase init error:', error.message);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple API key auth for admin endpoints
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.NOTIFICATION_API_KEY) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized' 
    });
  }

  try {
    const { title, body, data, targetPlatform, targetUsers } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, body' 
      });
    }

    initFirebase();
    
    if (!firebaseInitialized) {
      return res.status(500).json({ 
        success: false, 
        error: 'Firebase not configured' 
      });
    }

    await connectDB();

    // Build query
    const query = { isActive: true };
    if (targetPlatform) {
      query.platform = targetPlatform;
    }
    if (targetUsers && targetUsers.length > 0) {
      query.userId = { $in: targetUsers };
    }

    // Get tokens
    const tokens = await DeviceToken.find(query).select('token').lean();
    
    if (tokens.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No devices to notify',
        sent: 0,
      });
    }

    const tokenStrings = tokens.map(t => t.token);

    // Send notifications in batches
    const BATCH_SIZE = 500;
    let totalSuccess = 0;
    let totalFailure = 0;

    for (let i = 0; i < tokenStrings.length; i += BATCH_SIZE) {
      const batch = tokenStrings.slice(i, i + BATCH_SIZE);
      
      const message = {
        notification: { title, body },
        data: data || {},
        tokens: batch,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'spyll_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Handle failed tokens
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              failedTokens.push(batch[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await DeviceToken.updateMany(
            { token: { $in: failedTokens } },
            { isActive: false }
          );
        }
      } catch (batchError) {
        console.error('[Send Notification] Batch error:', batchError.message);
        totalFailure += batch.length;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications sent',
      stats: {
        totalDevices: tokenStrings.length,
        sent: totalSuccess,
        failed: totalFailure,
      },
    });

  } catch (error) {
    console.error('[Send Notification] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
