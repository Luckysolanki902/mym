import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // Validate the password (You might want to add proper password validation logic here)
    const { password1, password2 } = req.body;

    if (password1 === password2) {
      // Passwords match, grant admin access
      const secretKey = process.env.JWT_SECRET_KEY || 'default_secret_key'; // Use a default if not set
      const token = jwt.sign({ isAdmin: true }, secretKey);
      return res.status(200).json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, message: 'Passwords do not match the admin credentials.' });
    }
  } catch (error) {
    console.error('Error granting admin access:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
