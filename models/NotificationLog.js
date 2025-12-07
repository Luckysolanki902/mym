const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['LIKE_MILESTONE', 'NEW_COMMENT', 'NEW_DM', 'NEW_CONFESSION_BROADCAST'] 
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of Confession, Comment, or Message
  metadata: {
    milestone: Number, // For likes (1, 5, 10...)
    triggerUserId: mongoose.Schema.Types.ObjectId // Who triggered it (optional)
  },
  sentAt: { type: Date, default: Date.now }
});

// Compound index for fast lookups and deduplication
// Ensure we don't send the same milestone notification for the same confession to the same user twice
NotificationLogSchema.index({ recipientEmail: 1, type: 1, referenceId: 1, 'metadata.milestone': 1 }, { unique: true });

export default mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);
