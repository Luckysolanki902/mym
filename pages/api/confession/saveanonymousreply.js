// pages/api/confession/saveanonymousreply.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confessionId, encryptedConfessorMid, confessorGender, confessionContent, iv, replyContent, userMid } = req.body;

  try {
    // Your secret key from environment variables
    const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
    const secretKey = Buffer.from(secretKeyHex, 'hex');

    // Decrypt the encryptedConfessorMid using crypto
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'hex'));
    let decryptedMid = decipher.update(encryptedConfessorMid, 'hex', 'utf-8');
    decryptedMid += decipher.final('utf-8');

    // Encrypt the confessionContent using CryptoJS
    const encryptedConfessionContent = CryptoJS.AES.encrypt(confessionContent, secretKeyHex).toString();

    // Find the PersonalReply entry for the confessor
    let personalReply = await PersonalReply.findOne({
      confessionId,
      confessorMid: decryptedMid,
    });

    if (!personalReply) {
      // If no entry exists, create a new one with encrypted confessionContent
      personalReply = new PersonalReply({
        confessionId,
        confessorMid: decryptedMid,
        confessionContent: encryptedConfessionContent,
        confessorGender,
      });
    }

    // Encrypt the reply content
    const encryptedReplyContent = CryptoJS.AES.encrypt(replyContent.reply, secretKeyHex).toString();

    // Check if the replier has already replied
    const existingReplyIndex = personalReply.replies.findIndex(
      (reply) => reply.replierMid === replyContent.replierMid
    );

    if (existingReplyIndex > -1) {
      // If the replier has already replied, add the new reply as a secondary reply
      personalReply.replies[existingReplyIndex].secondaryReplies.push({
        content: encryptedReplyContent,
        sentBy: replyContent.replierMid,
        sentByConfessor: decryptedMid === userMid,
        replierGender: replyContent.replierGender,
        seen: [replyContent.replierMid], // Push the replier mid into seen
      });
    } else {
      // Add the reply to the array
      personalReply.replies.push({
        reply: encryptedReplyContent,
        replierMid: replyContent.replierMid,
        replierGender: replyContent.replierGender,
        seen: [replyContent.replierMid], // Initialize the seen array with replier mid
      });
    }

    // Save the updated entry
    await personalReply.save();

    res.status(201).json({ success: true, message: 'Anonymous reply saved successfully' });

    // --- Notification Logic (Async, Non-blocking) ---
    (async () => {
        try {
            const { sendNotification, NOTIFICATION_TYPES } = await import('@/utils/emailService');
            const { getEmailFromMid } = await import('@/utils/userHelpers');
            const { getNewDMTemplate } = await import('@/utils/emailTemplates/newDM');

            // Determine Recipient
            let recipientMid;
            // If userMid (sender) is the Confessor (decryptedMid), then recipient is the Replier (replyContent.replierMid)
            // If userMid (sender) is the Replier, then recipient is the Confessor (decryptedMid)
            
            if (userMid === decryptedMid) {
                // Sender is Confessor -> Notify Replier
                recipientMid = replyContent.replierMid;
            } else {
                // Sender is Replier -> Notify Confessor
                recipientMid = decryptedMid;
            }

            // Don't notify self
            if (recipientMid === userMid) return;

            const recipientEmail = await getEmailFromMid(recipientMid);

            console.log(`[Notification Debug] 📩 New DM Notification Process Started`);
            console.log(`[Notification Debug] 📤 Sender MID: ${userMid}`);
            console.log(`[Notification Debug] 📥 Recipient MID: ${recipientMid}`);
            console.log(`[Notification Debug] 🔄 Direction: ${userMid === decryptedMid ? 'Confessor -> Replier' : 'Replier -> Confessor'}`);

            if (recipientEmail) {
                console.log(`[Notification Debug] 📧 Recipient Email: ${recipientEmail}`);
                
                // Find the ID of the newly created subdocument for deduplication
                let newReplyId;
                const updatedReplyEntry = personalReply.replies.find(r => r.replierMid === replyContent.replierMid);
                if (updatedReplyEntry) {
                    if (existingReplyIndex > -1) {
                        // It was a secondary reply. Get the last one.
                        const lastSec = updatedReplyEntry.secondaryReplies[updatedReplyEntry.secondaryReplies.length - 1];
                        newReplyId = lastSec?._id;
                    } else {
                        // It was a new main reply
                        newReplyId = updatedReplyEntry._id;
                    }
                }

                if (newReplyId) {
                    const { subject, text } = getNewDMTemplate();

                    await sendNotification({
                        to: recipientEmail,
                        type: NOTIFICATION_TYPES.NEW_DM,
                        referenceId: newReplyId,
                        subject,
                        text
                    });
                    console.log(`[Notification Debug] ✅ DM Notification Sent to ${recipientEmail}`);
                } else {
                    console.log(`[Notification Debug] ⚠️ Could not determine new Reply ID for deduplication.`);
                }
            } else {
                console.log(`[Notification Debug] ⚠️ No email found for Recipient, skipping.`);
            }
        } catch (err) {
            console.error('[Notification Debug] ❌ Notification Error (DM):', err);
        }
    })();
    // ------------------------------------------------
  } catch (error) {
    console.error('Error saving anonymous reply:', error);
    res.status(500).json({ error: 'Unable to save anonymous reply', detailedError: error.message });
  }
};

export default connectToMongo(handler);
