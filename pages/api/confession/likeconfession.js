// pages/api/likeconfession.js
import connectToMongo from '@/middleware/middleware';
import Like from '@/models/Like';
import Confession from '@/models/Confession';

const handler = async (req, res) => {
    try {
        const { mid, confessionId } = req.body;

        // Find the confession
        const confession = await Confession.findById(confessionId);

        if (!confession) {
            return res.status(404).json({ error: 'Confession not found.' });
        }

        // Check if the user already liked the confession
        const existingLike = await Like.findOneAndDelete({
            confessionId: confessionId,
            mid: mid,
        });

        if (existingLike) {
            // Remove the like reference from the Confession document
            await Confession.findByIdAndUpdate(confessionId, { $pull: { likes: existingLike._id } });
            res.status(200).json({ message: 'Confession unliked successfully.' });
        } else {
            // If the user hasn't liked, create a new Like document
            const newLike = new Like({
                confessionId: confessionId,
                mid: mid,
            });

            // Save the new like
            await newLike.save();

            // Add the like reference to the Confession document
            const updatedConfession = await Confession.findByIdAndUpdate(confessionId, { $push: { likes: newLike._id } }, { new: true });
            res.status(200).json({ message: 'Confession liked successfully.' });

            // --- Notification Logic (Async, Non-blocking) ---
            (async () => {
                try {
                    const { sendNotification, NOTIFICATION_TYPES } = await import('@/utils/emailService');
                    const { getEmailFromMid } = await import('@/utils/userHelpers');
                    const { getLikeMilestoneTemplate } = await import('@/utils/emailTemplates/likeMilestone');
                    
                    const likeCount = updatedConfession.likes.length;
                    const milestones = [1, 5, 10, 25, 50, 100, 500, 1000];
                    console.log(`[Notification Debug] ❤️ Like Count: ${likeCount} | Milestones: ${milestones.join(', ')}`);

                    if (milestones.includes(likeCount)) {
                        console.log(`[Notification Debug] 🎯 Milestone Reached: ${likeCount} Likes! Initiating Notification...`);
                        
                        let decryptedMid;
                        try {
                            const crypto = (await import('crypto')).default;
                            const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
                            const secretKey = Buffer.from(secretKeyHex, 'hex');
                            const iv = Buffer.from(updatedConfession.iv, 'hex');
                            
                            const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
                            decryptedMid = decipher.update(updatedConfession.encryptedMid, 'hex', 'utf-8');
                            decryptedMid += decipher.final('utf-8');
                        } catch (decryptError) {
                            console.error(`[Notification Debug] ❌ Decryption Failed for Confession ${confessionId}:`, decryptError.message);
                            return;
                        }
                        
                        console.log(`[Notification Debug] 🔓 Decrypted Owner MID: ${decryptedMid}`);
                        const recipientEmail = await getEmailFromMid(decryptedMid);
                        console.log(`[Notification Debug] 📧 Resolved Email: ${recipientEmail ? recipientEmail : 'NOT FOUND'}`);
                        
                        if (recipientEmail) {
                            const { subject, text } = getLikeMilestoneTemplate({ likeCount, confessionId });
                            
                            const result = await sendNotification({
                                to: recipientEmail,
                                type: NOTIFICATION_TYPES.LIKE_MILESTONE,
                                referenceId: confessionId,
                                metadata: { milestone: likeCount },
                                subject,
                                text
                            });

                            if (result && result.success) {
                                console.log(`[Notification Debug] ✅ Like Milestone Notification Sent to ${recipientEmail}`);
                            } else {
                                console.log(`[Notification Debug] ⚠️ Notification Suppressed or Failed: ${result ? result.reason : 'Unknown Error'}`);
                            }
                        } else {
                            console.log(`[Notification Debug] ⚠️ No email found for MID, skipping notification.`);
                        }
                    } else {
                        console.log(`[Notification Debug] ℹ️ No milestone reached. Skipping.`);
                    }
                } catch (err) {
                    console.error('[Notification Debug] ❌ Notification Error (Like):', err);
                }
            })();
            // ------------------------------------------------
        }
    } catch (error) {
        console.error('Error liking/unliking confession:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export default connectToMongo(handler);
