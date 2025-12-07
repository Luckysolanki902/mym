export const getLikeMilestoneTemplate = ({ likeCount, confessionId }) => {
  const pageUrl = process.env.NEXT_PUBLIC_PAGEURL;
  
  // Dynamic copy based on virality level
  let title = `Your confession is heating up! 🔥`;
  let subtitle = `You hit ${likeCount} likes.`;
  
  if (likeCount >= 10) {
    title = `Okay, you're kinda famous now. 💅`;
    subtitle = `${likeCount} people related to your story.`;
  }
  if (likeCount >= 50) {
    title = `Your confession is going VIRAL. 🚀`;
    subtitle = `${likeCount} likes and counting. The tea is hot.`;
  }
  if (likeCount >= 100) {
    title = `Major Milestone Alert! 🚨`;
    subtitle = `You just hit ${likeCount} likes. You're basically an influencer now.`;
  }

  const subject = `${title} (${likeCount} Likes)`;
  
  const text = `
${title}

${subtitle}
Your anonymous confession is resonating with the community.

Don't leave your fans waiting. Check out the activity and see if anyone's trying to guess who you are.

View Confession: ${pageUrl}/confession/${confessionId}

- The Spyll Team
  `.trim();

  return { subject, text };
};
