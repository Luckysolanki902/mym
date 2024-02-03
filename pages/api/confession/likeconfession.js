// pages/api/likeconfession.js
import connectToMongo from '@/middleware/middleware';
import Like from '@/models/Like';
import Confession from '@/models/Confession';

const handler = async (req, res) => {
    try {
        const { email, confessionId, liked } = req.body;

        // Find the confession
        const confession = await Confession.findById(confessionId);

        if (!confession) {
            return res.status(404).json({ error: 'Confession not found.' });
        }

        // Check if the user already liked the confession
        const existingLike = await Like.findOneAndDelete({
            confessionId: confessionId,
            userEmail: email,
        });

        if (existingLike) {
            // Remove the like reference from the Confession document
            await Confession.findByIdAndUpdate(confessionId, { $pull: { likes: existingLike._id } });
            res.status(200).json({ message: 'Confession unliked successfully.' });
        } else {
            // If the user hasn't liked, create a new Like document
            const newLike = new Like({
                confessionId: confessionId,
                userEmail: email,
            });

            // Save the new like
            await newLike.save();

            // Add the like reference to the Confession document
            await Confession.findByIdAndUpdate(confessionId, { $push: { likes: newLike._id } });
            res.status(200).json({ message: 'Confession liked successfully.' });
        }
    } catch (error) {
        console.error('Error liking/unliking confession:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export default connectToMongo(handler);
