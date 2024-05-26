// Import necessary modules and models
import connectToMongo from '@/middleware/middleware';
import Comment from '@/models/Comment';

const handler = async (req, res) => {
    const { commentId, replyContent, gender } = req.body;

    try {
        // Find the comment by ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Create a new reply
        const newReply = {
            replyContent,
            gender,
        };

        // Push the new reply to the comment's replies array
        comment.replies.push(newReply);

        // Save the updated comment
        await comment.save();

        res.status(201).json({ message: 'Reply added successfully', newReply });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Unable to add reply', detailedError: error.message });
    }
};

export default connectToMongo(handler);
