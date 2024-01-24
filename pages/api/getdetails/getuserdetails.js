import connectToMongo from '@/middleware/middleware';
import User from '@/models/User';

async function handler(req, res) {
    const { userEmail } = req.query;
    try {
        const userDetails = await User.findOne({ email: userEmail });

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(userDetails);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch user details' });
    }
};


export default connectToMongo(handler);;
