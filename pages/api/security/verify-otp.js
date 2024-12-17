// pages/api/security/verify-otp.js
import jwt from 'jsonwebtoken';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; // Ensure Firebase is correctly initialized
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET; // Same as used in send-otp

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { enteredOTP, token, password, gender, college, isTestId } = req.body;

  if (!enteredOTP || !token || !password || !gender || !college) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email, otp: tokenOTP } = decoded;

    if (enteredOTP !== tokenOTP) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Create user in Firebase
    const authResult = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = authResult.user;

    // Create user in MongoDB
    const newUser = new User({
      email: email.toLowerCase(),
      gender,
      college,
      isVerified: !isTestId, // Mark as verified if not a test ID
    });

    await newUser.save();

    res.status(201).json({ message: 'User verified and created successfully.' });
  } catch (error) {
    console.error('Error verifying OTP or creating user:', error);
    if (error.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'OTP has expired. Please resend the OTP.' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token. Please resend the OTP.' });
    } else {
      res.status(500).json({ error: 'Failed to verify OTP or create user.' });
    }
  }
}

export default connectToMongo(handler);
