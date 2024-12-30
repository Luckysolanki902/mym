// pages/api/inbox/updatemainreplyseen.js

import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const updateMainReplySeen = async (req, res) => {
    if (req.method === 'POST') {
        const { confessionId, confessorMid, replierMid, userMid } = req.body;

        // Validate request body
        if (!confessionId || !confessorMid || !replierMid || !userMid) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {

            const personalReply = await PersonalReply.findOneAndUpdate(
                { confessionId, confessorMid, 'replies.replierMid': replierMid },
                { $addToSet: { 'replies.$.seen': userMid } },
                { new: true } // To return the updated document
            );

            if (!personalReply) {
                return res.status(404).json({ message: 'PersonalReply not found' });
            }


            res.status(200).json({ message: 'Main reply seen state updated successfully' });
        } catch (error) {
            console.error('Error updating main reply seen state:', error);
            res.status(500).json({ message: 'Failed to update main reply seen state' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default connectToMongo(updateMainReplySeen);
