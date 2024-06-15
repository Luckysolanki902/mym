import CryptoJS from 'crypto-js';
import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
    const college = req.query.college || '';
    const decCollege = decodeURIComponent(college);
    const page = parseInt(req.query.page) || 1; // Parse the page parameter
    const perPage = 10; // Number of confessions per page
    const skip = (page - 1) * perPage;

    const query = college ? { college: decCollege } : {};

    try {
        // Fetch confessions with pagination
        const confessions = await Confession.find(query).sort({ timestamps: -1 }).skip(skip).limit(perPage);

        // Decrypt the confession content
        const secretKeyHex = process.env.ENCRYPTION_SECRET_KEY;
        const decryptedConfessions = confessions.map(confession => {
            const bytes = CryptoJS.AES.decrypt(confession.confessionContent, secretKeyHex);
            const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
            return {
                ...confession.toObject(),
                confessionContent: decryptedContent,
            };
        });

        res.status(200).json({ confessions: decryptedConfessions });
    } catch (error) {
        console.error('Error fetching confessions:', error);
        res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
    }
};

export default connectToMongo(handler);
