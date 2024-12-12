import Confession from '@/models/Confession';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'Missing confession ID' });
      }

      const confession = await Confession.findById(id);
      if (!confession) {
        return res.status(404).json({ message: 'Confession not found' });
      }

      const { encryptedEmail, iv } = confession;
      const key = process.env.ENCRYPTION_SECRET_KEY;
      if (!key) {
        return res.status(500).json({ message: 'Encryption key not found' });
      }

      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

      let decryptedEmail = '';
      decryptedEmail += decipher.update(encryptedEmail, 'hex', 'utf-8');
      decryptedEmail += decipher.final('utf-8');

      return res.status(200).json({ confessor: decryptedEmail });
    } catch (error) {
      console.error('Error fetching confession details:', error);
      return res.status(500).json({ message: 'Error decrypting the email' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
