import dbConnect from '@/middleware/middleware';
import CallNote from '@/models/CallNote';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NOTES_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

// Encrypt content
function encryptContent(content) {
  const iv = CryptoJS.lib.WordArray.random(16).toString();
  const encrypted = CryptoJS.AES.encrypt(content, ENCRYPTION_KEY, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  return { encryptedContent: encrypted, iv };
}

// Decrypt content
function decryptContent(encryptedContent, iv) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    // Create a new note
    try {
      const { content, ownerId, ownerType, userEmail, callSessionId } = req.body;

      if (!content || !ownerId || !ownerType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: content, ownerId, ownerType' 
        });
      }

      if (!['verified', 'unverified'].includes(ownerType)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid ownerType. Must be "verified" or "unverified"' 
        });
      }

      // Encrypt the content
      const { encryptedContent, iv } = encryptContent(content);

      const note = await CallNote.create({
        ownerId,
        ownerType,
        userEmail: ownerType === 'verified' ? userEmail : undefined,
        encryptedContent,
        iv,
        callSessionId,
      });

      // Return decrypted content for immediate display
      res.status(201).json({
        success: true,
        note: {
          _id: note._id,
          content, // Return original content
          ownerId: note.ownerId,
          ownerType: note.ownerType,
          callSessionId: note.callSessionId,
          createdAt: note.createdAt,
        },
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ success: false, error: 'Failed to create note' });
    }
  } else if (req.method === 'GET') {
    // Get notes with pagination
    try {
      const { ownerId, userEmail, page = 1, limit = 20, before } = req.query;

      if (!ownerId && !userEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'Must provide either ownerId or userEmail' 
        });
      }

      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 50); // Max 50 per request

      // Build query
      const query = { isDeleted: false };
      
      if (userEmail) {
        // If user is verified, get all their notes (including ones from before verification)
        query.$or = [
          { userEmail },
          { ownerId, ownerType: 'unverified' }
        ];
      } else {
        query.ownerId = ownerId;
      }

      // Cursor-based pagination for better performance
      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const notes = await CallNote.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum + 1) // Get one extra to check if there are more
        .lean();

      const hasMore = notes.length > limitNum;
      const notesToReturn = hasMore ? notes.slice(0, limitNum) : notes;

      // Decrypt all notes
      const decryptedNotes = notesToReturn.map(note => ({
        _id: note._id,
        content: decryptContent(note.encryptedContent, note.iv),
        ownerId: note.ownerId,
        ownerType: note.ownerType,
        callSessionId: note.callSessionId,
        createdAt: note.createdAt,
      })).filter(note => note.content !== null); // Filter out failed decryptions

      res.status(200).json({
        success: true,
        notes: decryptedNotes,
        hasMore,
        nextCursor: hasMore ? notesToReturn[notesToReturn.length - 1].createdAt : null,
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notes' });
    }
  } else if (req.method === 'DELETE') {
    // Soft delete a note
    try {
      const { noteId, ownerId } = req.body;

      if (!noteId || !ownerId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: noteId, ownerId' 
        });
      }

      const note = await CallNote.findOneAndUpdate(
        { _id: noteId, ownerId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );

      if (!note) {
        return res.status(404).json({ success: false, error: 'Note not found' });
      }

      res.status(200).json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ success: false, error: 'Failed to delete note' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}
