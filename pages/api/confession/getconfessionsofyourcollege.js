import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
    const college = req.query.college || '';
    const decCollege = decodeURIComponent(college);
    console.log(decCollege)

    // Prepare the query based on whether college is provided or not
    const query = college ? { college: decCollege } : null;

    try {
        let confessions;
        if (query) {
            confessions = await Confession.find(query);
        } else {
            // If college is not provided, return null
            confessions = null;
        }
        res.status(200).json({ confessions });
    } catch (error) {
        console.error('Error fetching confessions:', error);
        res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
    }
};

export default connectToMongo(handler);
