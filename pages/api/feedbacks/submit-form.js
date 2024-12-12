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
      service: 'gmail', // Adjust service if using a different email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'luckysolanki902@gmail.com',
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