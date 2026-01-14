import nodemailer from 'nodemailer';
import NotificationLog from '../models/NotificationLog';

// Configure transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const NOTIFICATION_TYPES = {
  LIKE_MILESTONE: 'LIKE_MILESTONE',
  NEW_COMMENT: 'NEW_COMMENT',
  NEW_DM: 'NEW_DM',
  NEW_CONFESSION_BROADCAST: 'NEW_CONFESSION_BROADCAST',
};

/**
 * Sends an email notification with deduplication check.
 * This function is designed to be robust and non-blocking (swallows errors).
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.type - Notification type (from NOTIFICATION_TYPES)
 * @param {string} params.referenceId - ID of the related entity (Confession, Comment, etc.)
 * @param {Object} params.metadata - Additional data (milestone, triggerUserId)
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Email plain text content
 */
export async function sendNotification({ to, type, referenceId, metadata = {}, subject, text }) {
  try {
    if (!to || !type || !referenceId) {
      console.warn('[Notification] Missing required parameters');
      return;
    }

    // 1. Deduplication Check
    // Construct query based on type
    const query = {
      recipientEmail: to,
      type: type,
      referenceId: referenceId,
    };

    // For milestones, we must check the specific milestone number
    if (type === NOTIFICATION_TYPES.LIKE_MILESTONE) {
      if (!metadata.milestone) return; // Safety check
      query['metadata.milestone'] = metadata.milestone;
    }

    // Check if already sent
    console.log(`[Notification Service] 🔍 Checking for duplicates with query:`, JSON.stringify(query));
    const existingLog = await NotificationLog.findOne(query);
    if (existingLog) {
      console.log(`[Notification Service] ⚠️ Duplicate suppressed: ${type} for ${to} (Ref: ${referenceId})`);
      return { success: false, reason: 'duplicate' };
    }

    // 2. Send Email
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: to,
      replyTo: process.env.MAIL_FROM_EMAIL, // Improves deliverability
      subject: subject,
      text: text,
      headers: {
        'X-Entity-Ref-ID': referenceId,
        'List-Unsubscribe': `<mailto:${process.env.MAIL_FROM_EMAIL}?subject=unsubscribe>`, // Helps with spam filters
        'Precedence': 'bulk', // Hints that this is an automated notification
      }
    };

    console.log(`[Notification Service] 📨 Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Notification Service] ✅ Email sent! Message ID: ${info.messageId}`);

    // 3. Log Success
    await NotificationLog.create({
      recipientEmail: to,
      type: type,
      referenceId: referenceId,
      metadata: metadata,
    });

    return { success: true, messageId: info.messageId };

  } catch (error) {
    // Robustness: Log error but do not throw, so API flow isn't interrupted
    console.error('[Notification Service] ❌ Error sending email:', error);
    if (error.stack) console.error(error.stack);
    return { success: false, error: error.message };
  }
}

export { NOTIFICATION_TYPES };
