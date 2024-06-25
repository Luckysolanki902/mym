import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';
import Confession from '@/models/Confession';
import CryptoJS from 'crypto-js';


const handler = async (req, res) => {

    const { gender, confessionId, commentContent, mid } = req.body;

    try {
        const secretKey = process.env.ENCRYPTION_SECRET_KEY;
        // Check if the confession exists
        const confession = await Confession.findById(confessionId);

        if (!confession) {
            return res.status(404).json({ error: 'Confession not found.' });
        }
        const encryptedCommentContent = CryptoJS.AES.encrypt( commentContent, secretKey).toString();
        // Create a new comment
        const newComment = new Comment({
            gender,
            confessionId,
            commentContent: encryptedCommentContent,
            mid,
        });

        // Save the comment
        const savedComment = await newComment.save();

        // Update the Confession document to include the new comment reference
        await Confession.findByIdAndUpdate(confessionId, { $push: { comments: savedComment._id } });

        res.status(201).json({ message: 'Comment stored successfully', savedComment });
    } catch (error) {
        console.error('Error storing comment:', error);
        res.status(500).json({ error: 'Unable to store comment', detailedError: error.message });
    }
};

export default connectToMongo(handler);
