import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';
import Confession from '@/models/Confession';
import CryptoJS from 'crypto-js';


const handler = async (req, res) => {

    const { gender, confessionId, commentContent, mid } = req.body;

    try {
        const secretKey = process.env.ENCRYPTION_SECRET_KEY;
        // Check if the confession exists
        const confession = await Confession.findById(confessionId);

        if (!confession) {
            return res.status(404).json({ error: 'Confession not found.' });
        }
        const encryptedCommentContent = CryptoJS.AES.encrypt( commentContent, secretKey).toString();
        // Create a new comment
        const newComment = new Comment({
            gender,
            confessionId,
            commentContent: encryptedCommentContent,
            mid,
        });

        // Save the comment
        const savedComment = await newComment.save();

        // Update the Confession document to include the new comment reference
        await Confession.findByIdAndUpdate(confessionId, { $push: { comments: savedComment._id } });

        res.status(201).json({ message: 'Comment stored successfully', savedComment });

        // --- Notification Logic (Async, Non-blocking) ---
        (async () => {
            try {
                const { sendNotification, NOTIFICATION_TYPES } = await import('@/utils/emailService');
                const { getEmailFromMid } = await import('@/utils/userHelpers');
                const { getNewCommentTemplate } = await import('@/utils/emailTemplates/newComment');
                const crypto = (await import('crypto')).default;

                // Decrypt Confession Owner MID
                let decryptedMid;
                try {
                    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
                    const secretKey = Buffer.from(secretKeyHex, 'hex');
                    const iv = Buffer.from(confession.iv, 'hex');
                    
                    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
                    decryptedMid = decipher.update(confession.encryptedMid, 'hex', 'utf-8');
                    decryptedMid += decipher.final('utf-8');
                } catch (decryptError) {
                    console.error(`[Notification Debug] ❌ Decryption Failed for Confession ${confessionId}:`, decryptError.message);
                    return;
                }

                console.log(`[Notification Debug] 💬 New Comment on Confession ${confessionId}`);
                console.log(`[Notification Debug] 👤 Commenter MID: ${mid}`);
                console.log(`[Notification Debug] 👑 Owner MID: ${decryptedMid}`);

                // Don't notify if commenting on own confession
                if (decryptedMid === mid) {
                    console.log(`[Notification Debug] 🚫 Commenter is Owner. Skipping notification.`);
                    return;
                }

                const recipientEmail = await getEmailFromMid(decryptedMid);
                console.log(`[Notification Debug] 📧 Owner Email: ${recipientEmail ? recipientEmail : 'NOT FOUND'}`);

                if (recipientEmail) {
                    const { subject, text } = getNewCommentTemplate({ confessionId });

                    const result = await sendNotification({
                        to: recipientEmail,
                        type: NOTIFICATION_TYPES.NEW_COMMENT,
                        referenceId: savedComment._id, // Use comment ID to prevent duplicate alerts for same comment
                        subject,
                        text
                    });

                    if (result && result.success) {
                        console.log(`[Notification Debug] ✅ New Comment Notification Sent to ${recipientEmail}`);
                    } else {
                        console.log(`[Notification Debug] ⚠️ Notification Suppressed or Failed: ${result ? result.reason : 'Unknown Error'}`);
                    }
                } else {
                    console.log(`[Notification Debug] ⚠️ No email found for Owner, skipping.`);
                }
            } catch (err) {
                console.error('[Notification Debug] ❌ Notification Error (Comment):', err);
            }
        })();
        // ------------------------------------------------
    } catch (error) {
        console.error('Error storing comment:', error);
        res.status(500).json({ error: 'Unable to store comment', detailedError: error.message });
    }
};

export default connectToMongo(handler);
