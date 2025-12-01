// pages/api/marketing/send-emails.js

import connectToMongo from '@/middleware/middleware';
import MailMarketingUser from '@/models/MailMarketingUser';
import nodemailer from 'nodemailer';

// Define the handler function
const handler = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Parse the request body
        const { femaleCount, maleCount } = req.body;

        // Input validation
        if (
            typeof femaleCount !== 'number' ||
            typeof maleCount !== 'number' ||
            femaleCount < 0 ||
            maleCount < 0
        ) {
            return res.status(400).json({ error: 'Invalid input counts.' });
        }

        // Initialize results array
        const results = [];

        // Define the email HTML content with table-based layout and inline CSS
        const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spyll.in</title>
    </head>
    <body style="Margin:0;padding:0;min-width:100%; background-color: rgb(50, 50, 50);>
        <center style="width: 100%; table-layout: fixed;">
            <!-- Outer Wrapper Table -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="rgb(50, 50, 50)" style="Margin:0;padding:0;min-width:100%; background-color: rgb(50, 50, 50);">
                <tr>
                    <td align="center">
                        <!-- Inner Container Table -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:800px; Margin:0 auto;">
                            <!-- Header Section -->
                            <tr>
                                <td style="padding: 0px 0; text-align:center; background-color:rgb(50, 50, 50); color:#000000;">
                                    <img src="https://spyll.in/images/spyll_logos/spyll_main.png" alt="Spyll logo" style="width:40%; max-width:300px; display:block; margin:20px auto;">
                                    <p style="text-align:center; font-family: Jost, sans-serif; font-size:14px; color:#ffffff; margin:10px 0;">
                                        HBTU’s Anonymous Chat Platform <br>Is Waiting for You!
                                    </p>
                                    <a href="https://spyll.in" style="display:inline-block; text-decoration:none; background-color:#5EB3F0; color:rgb(250, 250, 250); padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; margin-bottom:20px;">
                                        Go to website
                                    </a>
                                    <img src="https://spyll.in/images/large_pngs/phone_mockup_mym_home2.png" alt="homepage-preview" style="width:80%; max-width:300px; display:block; Margin:0 auto;">
                                </td>
                            </tr>
                            <!-- Main Content Section -->
                            <tr bgcolor="#1F1F1F">
                                <td style="background-color:#1F1F1F; padding:20px; font-family: Jost, sans-serif; color:rgb(250, 250, 250); border-top-left-radius:0.8rem; border-top-right-radius:0.8rem ">
                                    <h3 style="font-size:18px; margin:0 0 10px 0; text-align:left; color:rgb(250, 250, 250);">Hey Harcourtians,</h3>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Exams are finally over, and the first semester is behind you. With everyone back home, the days feel slower
                                        and a little more boring…, And one thing’s still on your mind…
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:left; color:rgb(250, 250, 250);">
                                        You’re single.
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Maybe the late-night study sessions left no time to mingle. Or maybe, you just haven’t found that someone yet
                                        to share long texts, inside jokes, and those dreamy walks across campus when the next semester begins.
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Well, guess what? spyll.in is here to make your break way more exciting! 🚀
                                    </p>

                                    <h3 style="font-size:18px; margin:20px 0 10px 0; text-align:left; color:rgb(250, 250, 250);">What is spyll.in?</h3>

                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        It’s a fun and easy way to chat with random students from HBTU—without even signing in! You can instantly
                                        connect, chat anonymously, and see where the conversation takes you. No need to create an account, just jump
                                        in and start talking!
                                    </p>
                                    <h2 style="font-size:16px; text-align:center; margin:20px 0 10px 0; color:rgb(250, 250, 250);">Here's why it's what you need right now</h2>

                                    <!-- Features Grid -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:0 auto; background-color:#1F1F1F;">
                                        <tr>
                                            <td style="width:50%; vertical-align:top; padding:10px; background-color:#1F1F1F;">
                                                <img src="https://spyll.in/images/othericons/bubble-chat2.png" alt="Anonymous Chats" style="width:50px; height:auto; display:block; Margin:0 auto; ">
                                                <h4 style="font-size:16px; text-align:center; margin:10px 0 5px 0; color:rgb(250, 250, 250);">Anonymous Chats</h4>
                                                <p style="font-size:14px; line-height:1.5; text-align:center; color:rgb(250, 250, 250);">
                                                    Say hello to random people from HBTU, without even revealing who you are. No more hiding behind a mask.
                                                </p>
                                            </td>
                                            <td style="width:50%; vertical-align:top; padding:10px; background-color:#1F1F1F;">
                                                <img src="https://spyll.in/images/othericons/network2.png" alt="Real Connections" style="width:50px; height:auto; display:block; Margin:0 auto; ">
                                                <h4 style="font-size:16px; text-align:center; margin:10px 0 5px 0; color:rgb(250, 250, 250);">Real Connections</h4>
                                                <p style="font-size:14px; line-height:1.5; text-align:center; color:rgb(250, 250, 250);">
                                                    Imagine starting the new semester with a new friend who’s just as excited to see you as you are.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="width:50%; vertical-align:top; padding:10px; background-color:#1F1F1F;">
                                                <img src="https://spyll.in/images/othericons/feather2.png" alt="Confession Space" style="width:50px; height:auto; display:block; Margin:0 auto; ">
                                                <h4 style="font-size:16px; text-align:center; margin:10px 0 5px 0; color:rgb(250, 250, 250);">Confession Space</h4>
                                                <p style="font-size:14px; line-height:1.5; text-align:center; color:rgb(250, 250, 250);">
                                                    Spill your heart out anonymously. Write what you've been holding back. Read what other people have to say.
                                                </p>
                                            </td>
                                            <td style="width:50%; vertical-align:top; padding:10px; background-color:#1F1F1F;">
                                                <img src="https://spyll.in/images/othericons/privacy2.png" alt="Total Privacy" style="width:50px; height:auto; display:block; Margin:0 auto; ">
                                                <h4 style="font-size:16px; text-align:center; margin:10px 0 5px 0; color:rgb(250, 250, 250);">Total Privacy</h4>
                                                <p style="font-size:14px; line-height:1.5; text-align:center; color:rgb(250, 250, 250);">
                                                    Your chats are secure and private — end-to-end encryption and browser-to-browser chats with no storage involved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        The best part? Everyone’s in the same boat right now. So why not take a chance, have fun, and see where it goes? spyll.in isn’t just an app. It’s your chance to make this winter unforgettable. ❄
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Ready to connect, chat, and maybe find your perfect match?
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Cheers to late-night conversations and future memories <br>Team spyll.in
                                    </p>
                                    <p style="font-size:14px; line-height:1.5; text-align:justify; color:rgb(250, 250, 250);">
                                        Don’t wait too long to make your move—your match might already be waiting for you! ⭐
                                    </p>

                                    <!-- Additional Go to Website Button -->
                                    <a href="https://spyll.in" style="display:inline-block; text-decoration:none; background-color:#5EB3F0; color:rgb(250, 250, 250); padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; margin:20px 0 20px 0;">
                                        Go to website
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <!-- End Inner Container Table -->
                    </td>
                </tr>
            </table>
            <!-- End Outer Wrapper Table -->
        </center>
    </body>
    </html>
    `;

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
            },
        });

        // Function to send email and update sentCount
        const sendEmail = async (user) => {
            try {
                // Send the email
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: "HBTU’s Anonymous Chat Platform Is Waiting for You!",
                    html: emailHTML,
                });

                // Update the sentCount to 1 atomically
                const updatedUser = await MailMarketingUser.findOneAndUpdate(
                    { _id: user._id, sentCount: { $lt: 1 } }, // Ensure sentCount is less than 1
                    { $inc: { sentCount: 1 } },
                    { new: true }
                );

                if (updatedUser) {
                    return { email: user.email, status: 'sent' };
                } else {
                    // If sentCount was already 1 or more
                    return { email: user.email, status: 'not sent (already sent)' };
                }
            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
                return { email: user.email, status: 'not sent (error)' };
            }
        };

        // Fetch female users
        const femaleUsers = await MailMarketingUser.find({
            gender: ' Female',
            sentCount: { $lt: 1 },
        }).limit(femaleCount);

        // Fetch male users
        const maleUsers = await MailMarketingUser.find({
            gender: 'Male',
            sentCount: { $lt: 1 },
        }).limit(maleCount);

        // Combine selected users
        const selectedUsers = [...femaleUsers, ...maleUsers];

        // Iterate over selected users and send emails
        for (const user of selectedUsers) {
            const result = await sendEmail(user);
            results.push(result);
        }

        // Respond with the results
        return res.status(200).json({ results });
    } catch (error) {
        console.error('Error in send-emails handler:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Export the handler wrapped with the MongoDB connection middleware
export default connectToMongo(handler);
