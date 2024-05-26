import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';

const handler = async (req, res) => {
    try {
        const { email, commentId, replyId } = req.body;

        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Find the reply within the comment
        const reply = comment.replies.find(reply => reply._id.toString() === replyId);

        if (!reply) {
            return res.status(404).json({ error: 'Reply not found.' });
        }

        // Check if the user already liked the reply
        const existingLikeIndex = reply.likes.indexOf(email);
        if (existingLikeIndex !== -1) {
            // User already liked the reply, so unlike it
            reply.likes.splice(existingLikeIndex, 1);
        } else {
            // User hasn't liked the reply, so like it
            reply.likes.push(email);
        }

        // Save the updated comment
        await comment.save();

        res.status(200).json({ message: 'Reply liked/unliked successfully.', likes: reply.likes.length });
    } catch (error) {
        console.error('Error liking/unliking reply:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export default connectToMongo(handler);
