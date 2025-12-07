// pages/api/security/send-otp.js
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import LRU from 'lru-cache';
import connectToMongo from '@/middleware/middleware';
import TestEmail from '@/models/TestEmail';
import { getOtpTemplate } from '@/utils/emailTemplates/otpVerification';

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your environment variables
const OTP_EXPIRATION = '10m'; // OTP valid for 10 minutes

// Rate Limiting Configuration
const rateLimitOptions = {
  max: 5, // Maximum 5 OTPs
  ttl: 1000 * 60 * 60, // Per hour
};

const rateLimiter = new LRU({
  max: 1000, // Maximum number of unique emails to track
  ttl: rateLimitOptions.ttl, // Time to live in ms
});

// Helper function to increment OTP count
const incrementOTP = (email) => {
  const current = rateLimiter.get(email) || 0;
  rateLimiter.set(email, current + 1);
  return current + 1;
};

// Helper function to get OTP count
const getOTPCount = (email) => {
  return rateLimiter.get(email) || 0;
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Rate Limiting Check
    const otpCount = getOTPCount(email);
    if (otpCount >= rateLimitOptions.max) {
      return res.status(429).json({ error: 'Too many OTP requests. Please try again later.' });
    }

    // Increment OTP count
    incrementOTP(email);

    // Check if email is a Test ID
    const isTestId = await TestEmail.findOne({ email });
    let generatedOTP;

    if (isTestId) {
      generatedOTP = '123456';
    } else {
      // Generate a random 6-digit OTP
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const { subject, text } = getOtpTemplate({ otp: generatedOTP });

      // Define email options
      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
        to: email,
        replyTo: process.env.MAIL_FROM_EMAIL,
        subject: subject,
        text: text,
      };

      // Send OTP email
      await transporter.sendMail(mailOptions);
    }

    // Create a JWT containing the email and OTP
    const token = jwt.sign(
      { email, otp: generatedOTP },
      JWT_SECRET,
      { expiresIn: OTP_EXPIRATION }
    );

    res.status(200).json({ message: 'OTP sent successfully!', token });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
}

export default connectToMongo(handler);
