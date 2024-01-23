// pages/api/security/validate-otp.js
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;
  console.log(email, otp)

  try {
    // Verify the OTP against the stored OTP in the database
    const user = await User.findOne({ email });
    console.log(user.otp, 'otp saved')

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    // Update the user's isVerified status
    user.isVerified = true;

    // Clear the OTP in the database after successful verification
    user.otp = undefined;

    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

export default connectToMongo(handler);
