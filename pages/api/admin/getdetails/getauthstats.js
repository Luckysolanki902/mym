import User from '@/models/User';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
  try {
    // Get the total number of users
    const totalUsers = await User.countDocuments();

    // Get the number of male users
    const maleUsers = await User.countDocuments({ gender: 'male' });

    // Get the number of female users
    const femaleUsers = await User.countDocuments({ gender: 'female' });

    // Get the number of users by college
    const collegeStats = await User.aggregate([
      { $group: { _id: "$college", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalUsers,
      maleUsers,
      femaleUsers,
      collegeStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Unable to fetch user stats', detailedError: error.message });
  }
};

export default connectToMongo(handler);
