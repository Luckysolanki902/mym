// pages/api/security/send-otp.js
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import LRU from 'lru-cache';

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

export default async function handler(req, res) {
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

    // Generate a random 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
      },
    });

    // Define HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f4;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff; border-radius:8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td align="center" style="padding: 40px 20px 20px 20px; font-family: Arial, sans-serif;">
                      <h2 style="color:#333333; margin:0 0 20px 0;">Welcome to MYM!</h2>
                      <p style="color:#555555; font-size:16px; line-height:1.5;">
                        Thank you for signing up. Please use the verification code below to complete your registration.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 20px;">
                      <div style="background-color:#ffffff; padding: 20px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="color:#000000; font-size:24px; font-weight:bold; margin:0;">${generatedOTP}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 20px; font-family: Arial, sans-serif;">
                      <p style="color:#999999; font-size:14px; line-height:1.5;">
                        This OTP is valid for 10 minutes.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 20px 20px 40px 20px; font-family: Arial, sans-serif;">
                      <p style="color:#555555; font-size:14px; line-height:1.5;">
                        Thank you,<br/>The MYM Team
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'MYM - Verify Your Email',
      html: htmlContent,
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);

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
