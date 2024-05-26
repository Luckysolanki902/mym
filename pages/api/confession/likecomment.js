// pages/api/likecomment.js
import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';

const handler = async (req, res) => {
    try {
        const { email, commentId } = req.body;

        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Check if the user already liked the comment
        const existingLikeIndex = comment.likes.indexOf(email);
        if (existingLikeIndex !== -1) {
            // User already liked the comment, so unlike it
            comment.likes.splice(existingLikeIndex, 1);
        } else {
            // User hasn't liked the comment, so like it
            comment.likes.push(email);
        }

        // Save the updated comment
        await comment.save();

        res.status(200).json({ message: 'Comment liked/unliked successfully.', likes: comment.likes.length });
    } catch (error) {
        console.error('Error liking/unliking comment:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export default connectToMongo(handler);
