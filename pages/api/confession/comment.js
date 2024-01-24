import Comment from '@/models/Comment';
import connectToMongo from '@/middleware/middleware';

const handler = async (req, res) => {
    const { email,gender, confessionId, commentContent } = req.body;

    try {
        const newComment = new Comment({
            userEmail: email,
            gender,
            confessionId,
            commentContent,
        });

        const savedComment = await newComment.save();

        res.status(201).json({ message: 'Comment stored successfully', savedComment });
    } catch (error) {
        console.error('Error storing comment:', error);
        res.status(500).json({ error: 'Unable to store comment', detailedError: error.message });
    }
};

export default connectToMongo(handler);
