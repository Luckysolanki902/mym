import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';
import TestEmail from '@/models/TestEmail';

async function handler(req, res) {
    
    const { userEmail } = req.query;
    try {
        let userDetails = await User.findOne({ email: userEmail }).lean();

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if it's a test email and force verification if so
        const isTestEmail = await TestEmail.findOne({ email: userEmail });
        if (isTestEmail) {
            userDetails.isVerified = true;
        }

        res.status(200).json(userDetails);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch user details' });
    }
};


export default connectToMongo(handler);;
