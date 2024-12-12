// pages/api/inbox/unseen-count.js
import PersonalReply from '@/models/PersonalReply';
import connectToMongo from '@/middleware/middleware';

const countUnseenHandler = async (req, res) => {

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { mid } = req.query;

  if (!mid) {
    return res.status(400).json({ error: 'Missing user mid' });
  }

  // Normalize mid (optional but recommended)
  const normalizedMid = mid.trim().toLowerCase();

  try {
    // Initial Aggregation Stages
    const matchStage = { confessorMid: normalizedMid };

    const unwindReplies = { $unwind: "$replies" };

    const initialAggregation = [
      { $match: matchStage },
      unwindReplies
    ];

    const initialResults = await PersonalReply.aggregate(initialAggregation);

    if (!initialResults.length) {
      return res.status(200).json({ totalUnseenCount1: 0, totalUnseenCount2: 0 });
    }

    // Full Aggregation with Facets
    const aggregation = [
      { $match: { confessorMid: normalizedMid } },
      { $unwind: { path: "$replies", preserveNullAndEmptyArrays: false } },
      {
        $facet: {
          totalUnseenPrimary: [
            {
              $match: {
                "replies.seen": { $nin: [normalizedMid] }
              }
            },
            {
              $count: "count"
            }
          ],
          totalUnseenSecondary: [
            { $unwind: { path: "$replies.secondaryReplies", preserveNullAndEmptyArrays: false } },
            {
              $match: {
                "replies.secondaryReplies.seen": { $nin: [normalizedMid] }
              }
            },
            {
              $count: "count"
            }
          ],
          userUnseenPrimary: [
            {
              $match: {
                "replies.replierMid": normalizedMid,
                "replies.seen": { $nin: [normalizedMid] }
              }
            },
            {
              $count: "count"
            }
          ],
          userUnseenSecondary: [
            { $unwind: { path: "$replies.secondaryReplies", preserveNullAndEmptyArrays: false } },
            {
              $match: {
                "replies.secondaryReplies.sentBy": normalizedMid,
                "replies.secondaryReplies.seen": { $nin: [normalizedMid] }
              }
            },
            {
              $count: "count"
            }
          ]
        }
      },
      {
        $project: {
          totalUnseenPrimary: 1,
          totalUnseenSecondary: 1,
          userUnseenPrimary: 1,
          userUnseenSecondary: 1,
          totalUnseenCount1: { $add: [
            { $ifNull: [ { $arrayElemAt: ["$totalUnseenPrimary.count", 0] }, 0 ] },
            { $ifNull: [ { $arrayElemAt: ["$totalUnseenSecondary.count", 0] }, 0 ] }
          ] },
          totalUnseenCount2: { $add: [
            { $ifNull: [ { $arrayElemAt: ["$userUnseenPrimary.count", 0] }, 0 ] },
            { $ifNull: [ { $arrayElemAt: ["$userUnseenSecondary.count", 0] }, 0 ] }
          ] }
        }
      }
    ];

    const results = await PersonalReply.aggregate(aggregation);

    if (!results.length) {
      return res.status(200).json({ totalUnseenCount1: 0, totalUnseenCount2: 0 });
    }

    const {
      totalUnseenPrimary,
      totalUnseenSecondary,
      userUnseenPrimary,
      userUnseenSecondary,
      totalUnseenCount1,
      totalUnseenCount2
    } = results[0];



    res.status(200).json({ 
      totalUnseenCount1,
      totalUnseenCount2
    });
  } catch (error) {
    console.error('Error counting unseen replies:', error);
    res.status(500).json({ error: 'Unable to count unseen replies', detailedError: error.message });
  }
};

export default connectToMongo(countUnseenHandler);
