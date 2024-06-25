// pages/api/inbox/updatesecondaryrepliesseen.js

import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const updateSecondaryRepliesSeen = async (req, res) => {
    if (req.method === 'POST') {
        const { confessionId, confessorMid, primaryReplyId, userMid } = req.body;

        try {
            // Find the PersonalReply entry for the confessor
            const personalReply = await PersonalReply.findOne({
                confessionId,
                confessorMid,
            });

            if (!personalReply) {
                return res.status(404).json({ message: 'Confession not found' });
            }

            // Find the primary reply by _id
            const primaryReply = personalReply.replies.find(reply => reply._id.toString() === primaryReplyId);
            if (!primaryReply) {
                return res.status(404).json({ message: 'Primary reply not found' });
            }
            // Update seen state for all secondary replies of the primary reply
            primaryReply.secondaryReplies.forEach(secondaryReply => {
                if (!secondaryReply.seen.includes(userMid)) {
                    secondaryReply.seen.push(userMid);
                }
            });

            // Save the updated PersonalReply document
            await personalReply.save();

            res.status(200).json({ message: 'All secondary replies seen state updated successfully' });
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
