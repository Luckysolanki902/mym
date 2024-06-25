// pages/api/comment/replytocomment.js

import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';

const handler = async (req, res) => {
    const { commentId, replyContent, gender, mid } = req.body;

    if (!commentId || !replyContent || !gender) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Your secret key from environment variables
        const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;

        if (!secretKeyHex) {
            throw new Error('Encryption secret key is not defined in environment variables');
        }

        const secretKey = Buffer.from(secretKeyHex, 'hex');

        // Encrypt the reply content using CryptoJS
        const encryptedReplyContent = CryptoJS.AES.encrypt(replyContent, secretKeyHex).toString();

        // Find the comment by ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Create a new reply
        const newReply = {
            replyContent: encryptedReplyContent,
            gender,
            mid,
        };

        // Push the new reply to the comment's replies array
        comment.replies.push(newReply);

        // Save the updated comment
        await comment.save();

        res.status(201).json({ message: 'Reply added successfully', newReply });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Unable to add reply', detailedError: error.message });
    }
};

export default connectToMongo(handler);
