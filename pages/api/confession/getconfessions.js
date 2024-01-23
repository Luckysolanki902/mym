import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
    try {
        const confessions = await Confession.find({});
        res.status(200).json({ confessions });
    } catch (error) {
        console.error('Error fetching confessions:', error);
        res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
    }
};

export default connectToMongo(handler);