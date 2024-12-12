// pages/api/inbox/updatesecondaryrepliesseen.js

import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';
import mongoose from 'mongoose';

const updateSecondaryRepliesSeen = async (req, res) => {
    if (req.method === 'POST') {
        const { confessionId, confessorMid, primaryReplyId, userMid } = req.body;

        // Validate request body
        if (!confessionId || !confessorMid || !primaryReplyId || !userMid) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {

            // Validate ObjectId for primaryReplyId
            if (!mongoose.Types.ObjectId.isValid(primaryReplyId)) {
                return res.status(400).json({ message: 'Invalid primaryReplyId' });
            }

            // Find the PersonalReply entry for the confessor and the specific primary reply
            const personalReply = await PersonalReply.findOne({
                confessionId,
                confessorMid,
            });

            if (!personalReply) {
                return res.status(404).json({ message: 'Confession not found' });
            }

            // Find the primary reply by _id
            const primaryReply = personalReply.replies.id(primaryReplyId);
            if (!primaryReply) {
                return res.status(404).json({ message: 'Primary reply not found' });
            }


            // Update seen state for all secondary replies of the primary reply
            let updated = false;
            primaryReply.secondaryReplies.forEach(secondaryReply => {
                if (!secondaryReply.seen.includes(userMid)) {
                    secondaryReply.seen.push(userMid);
                    updated = true;
                }
            });

            if (updated) {
                await personalReply.save();
                res.status(200).json({ message: 'All secondary replies seen state updated successfully' });
            } else {
                res.status(200).json({ message: 'No secondary replies needed updating' });
            }
        } catch (error) {
            console.error('Error updating all secondary replies seen state:', error);
            res.status(500).json({ message: 'Failed to update all secondary replies seen state', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default connectToMongo(updateSecondaryRepliesSeen);
