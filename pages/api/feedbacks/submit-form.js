import nodemailer from 'nodemailer';
import connectToMongo from '@/middleware/middleware';
import UserForm from '@/models/UserForm';

const handler = async (req, res) => {
  try {
    const { category, description, recreateBug, collegeName, collegeId, confessionLink, email } = req.body;

    // Create a new UserForm document and save it to the database
    const newUserForm = new UserForm({ category, description, recreateBug, collegeName, collegeId, confessionLink, email });
    await newUserForm.save();

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Prepare email content
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: 'luckysolanki902@gmail.com',
      replyTo: email || process.env.MAIL_FROM_EMAIL,
      subject: `New Feedback Submitted: ${category}`,
      text: `Details of the feedback:

Category: ${category}
Description: ${description}
${recreateBug ? `How to Recreate Bug: ${recreateBug}` : ''}
${collegeName ? `College Name: ${collegeName}` : ''}
${collegeId ? `College ID: ${collegeId}` : ''}
${confessionLink ? `Confession Link: ${confessionLink}` : ''}
${email ? `User Email: ${email}` : ''}

This feedback was submitted via the user feedback form.`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: 'Form submitted and email sent successfully' });
  } catch (error) {
    console.error('Error submitting form or sending email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default connectToMongo(handler);