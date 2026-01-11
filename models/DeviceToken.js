// DeviceToken Model for Push Notifications
// Stores FCM tokens for each user's devices

import mongoose from 'mongoose';

const DeviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web'],
    required: true,
  },
  deviceInfo: {
    type: Object,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
DeviceTokenSchema.index({ userId: 1, isActive: 1 });
DeviceTokenSchema.index({ isActive: 1, platform: 1 });
DeviceTokenSchema.index({ token: 1 }, { unique: true });

// Delete old inactive tokens after 30 days
DeviceTokenSchema.index(
  { lastUsed: 1 },
  { 
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isActive: false }
  }
);

const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', DeviceTokenSchema);

export default DeviceToken;
