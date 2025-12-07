export const getNewCommentTemplate = ({ confessionId }) => {
  const pageUrl = process.env.NEXT_PUBLIC_PAGEURL;
  
  const subject = `New comment on your confession`;
  
  const text = `
Someone just commented on your anonymous confession.

See what they said:
${pageUrl}/confession/${confessionId}
  `.trim();

  return { subject, text };
};
