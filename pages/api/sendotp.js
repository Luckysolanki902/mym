import nodemailer from 'nodemailer';
import connectToMongo from '@/middleware/middleware';
import User from '@/models/User'; // Import your User model

async function handler(req, res) {

    const { email, otp } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "luckysolanki902@gmail.com",
            pass: "rgmowrqyiedscozm",
        },
    });
    try {
        // Sending OTP email
        const mailOptions = {
            from: "luckysolanki902@gmail.com",
            to: email,
            subject: 'MYM - Verify Your Email',
            text: `Your OTP for verification is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        // Find the user by email and update the isVerified field
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Find by email
            { $set: { isVerified: true } }, // Update isVerified to true
            { new: true } // To return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'OTP sent successfully!', updatedUser });
    } catch (error) {
        console.error('Error sending OTP or updating user:', error);
        res.status(500).json({ error: 'Failed to send OTP or update user.' });
    }

}

export default connectToMongo(handler);
