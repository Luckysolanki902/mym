export const getNewCommentTemplate = ({ confessionId }) => {
  const pageUrl = process.env.NEXT_PUBLIC_PAGEURL;
  
  const subject = `💬 Someone commented on your confession`;
  
  const text = `
New Comment!

Someone just commented on your anonymous confession.
"Check out what they said..."

View Comment: ${pageUrl}/confession/${confessionId}

- The Spyll Team
  `.trim();

  return { subject, text };
};
