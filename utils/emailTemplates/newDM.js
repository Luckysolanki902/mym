export const getNewDMTemplate = () => {
  const pageUrl = process.env.NEXT_PUBLIC_PAGEURL;
  
  const subject = `Pbbt! You have a new anonymous message`;
  
  const text = `
New Secret Message!

You have received a new message in your inbox.
Someone wants to talk to you (anonymously, of course).

Check Inbox: ${pageUrl}/inbox

- The Spyll Team
  `.trim();

  return { subject, text };
};
