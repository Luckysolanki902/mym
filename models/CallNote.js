import mongoose from 'mongoose';

const CallNoteSchema = new mongoose.Schema({
  // Owner identification - supports both verified and unverified users
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  ownerType: {
    type: String,
    enum: ['verified', 'unverified'],
    required: true,
    index: true,
  },
  // Optional: link to verified user if they sign in later
  userEmail: {
    type: String,
    index: true,
    sparse: true,
  },
  // Encrypted content
  encryptedContent: {
    type: String,
    required: true,
  },
  // IV for decryption
  iv: {
    type: String,
    required: true,
  },
  // Call context (optional)
  callSessionId: {
    type: String,
    index: true,
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { 
  timestamps: true,
  // Index for efficient pagination queries
});

// Compound index for efficient owner-based queries with pagination
CallNoteSchema.index({ ownerId: 1, isDeleted: 1, createdAt: -1 });
CallNoteSchema.index({ userEmail: 1, isDeleted: 1, createdAt: -1 });

export default mongoose.models.CallNote || mongoose.model('CallNote', CallNoteSchema);
