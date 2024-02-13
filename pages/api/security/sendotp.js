// pages/api/security/sendotp.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';
import nodemailer from 'nodemailer';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Generate a random 6-digit OTP
  const generatedOTP = Math.floor(100000 + Math.random() * 900000);
console.log(generatedOTP, email)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Update the user's OTP in the database
    existingUser.otp = generatedOTP;
    await existingUser.save();

    // Sending OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'MYM - Verify Your Email',
      text: `Your OTP for verification is: ${generatedOTP}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Error sending OTP or updating user:', error);
    res.status(500).json({ error: 'Failed to send OTP or update user.' });
  }
}

export default connectToMongo(handler);
