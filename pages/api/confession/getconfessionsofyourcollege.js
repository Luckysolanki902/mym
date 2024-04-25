import Confession from '@/models/Confession';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
    const college = req.query.college || '';
    const decCollege = decodeURIComponent(college);
    const page = parseInt(req.query.page) || 1; // Parse the page parameter

    // Calculate the number of confessions to skip based on the page number
    const perPage = 10; // Number of confessions per page
    const skip = (page - 1) * perPage;

    // Prepare the query based on whether college is provided or not
    const query = college ? { college: decCollege } : {};

    try {
        let confessions;
        if (college) {
            // Fetch confessions with pagination
            confessions = await Confession.find(query).sort({ timestamps: -1 }).skip(skip).limit(perPage);
        } else {
            // If college is not provided, return null or an empty array based on your preference
            confessions = [];
        }
        res.status(200).json({ confessions });
    } catch (error) {
        console.error('Error fetching confessions:', error);
        res.status(500).json({ error: 'Unable to fetch confessions', detailedError: error.message });
    }
};

export default connectToMongo(handler);
