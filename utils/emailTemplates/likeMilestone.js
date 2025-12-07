export const getLikeMilestoneTemplate = ({ likeCount, confessionId }) => {
  const pageUrl = process.env.NEXT_PUBLIC_PAGEURL;
  
  let title = `Someone liked your confession`;
  let subtitle = `Your anonymous post just got its first like. Someone relates to what you said.`;
  
  if (likeCount >= 10) {
    title = `Your confession is getting noticed`;
    subtitle = `${likeCount} people have liked your post. It's starting to pick up.`;
  }
  if (likeCount >= 25) {
    title = `25 likes on your confession`;
    subtitle = `Your post is resonating with people. 25 likes and counting.`;
  }
  if (likeCount >= 50) {
    title = `50 likes on your confession`;
    subtitle = `Your post is resonating with people. 50 likes and counting.`;
  }
  if (likeCount >= 100) {
    title = `Your confession is blowing up 🔥`;
    subtitle = `Over ${likeCount} people have liked your post. It's a hot topic right now.`;
  }

  const subject = `${title}`;
  
  const text = `
${title}

${subtitle}

Check out the activity:
${pageUrl}/confession/${confessionId}
  `.trim();

  return { subject, text };
};
