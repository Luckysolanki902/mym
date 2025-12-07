export const getOtpTemplate = ({ otp }) => {
  const subject = `Your Verification Code: ${otp}`;
  
  const text = `
Welcome to Spyll.

Your verification code is:
${otp}

This code will expire in 10 minutes.
If you didn't request this, you can safely ignore this email.

- The Spyll Team
  `.trim();

  return { subject, text };
};
