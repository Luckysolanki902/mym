import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Grid, Button } from '@mui/material';

const AboutUsPage = () => {

    return (
        <div>
            <Head>
                <title>About Us | Meet Your Mate</title>
                <meta name="description" content="Learn more about Meet Your Mate - the ultimate social platform for college students in India." />
            </Head>

            <Container maxWidth="md" sx={{ paddingTop: 8 }}>
                <Typography variant="h4" gutterBottom>About Meet Your Mate</Typography>
                <Typography variant="body1" paragraph>
                    Welcome to Meet Your Mate, the anonymous social media platform designed exclusively for college students across India!
                </Typography>
                <Typography variant="body1" paragraph>
                    Feeling disconnected on campus? Meet Your Mate is here to bridge the gap! We're more than just another social media platform. We're a vibrant community where students can connect anonymously, share experiences, and find the support they need to thrive.
                </Typography>
                <Typography variant="body1" paragraph>
                    At Meet Your Mate, our mission is to foster meaningful connections and create a vibrant community where students can connect, share, and thrive. Whether you're looking for new friends, seeking academic support, or hoping to find that special someone, Meet Your Mate is your go-to destination for all things social.
                </Typography>
                <Typography variant="body1" paragraph>
                    Our platform offers a range of exciting features, including:
                </Typography>
                <ul>
                <li>Anonymous Random Chat: Connect with fellow college students from HBTU and beyond in a safe, anonymous environment. All chats are encrypted using AES-256, ensuring that only you and your chat partner can read the messages. Plus, your privacy is further protected as chats automatically disappear once you find a new pair, ensuring that your conversations remain private and transient.</li>
                <li>Confessions: Pour out your thoughts, experiences, and secrets anonymously, and engage with others who relate to your confessions. Your privacy is our utmost priority – we don't store any personal information such as email addresses. In fact, we only save your gender along with the confession content itself, ensuring that your identity remains completely anonymous at all times. Rest assured, your confessions are securely encrypted and your privacy is fiercely protected.</li>
                </ul>
                <Typography variant="body1" paragraph>
                    But Meet Your Mate is more than just a social platform – it's a community. We're committed to ensuring that every interaction on our platform is positive, respectful, and inclusive. Our dedicated team works tirelessly to uphold our community guidelines and keep Meet Your Mate a welcoming space for all.
                </Typography>
                <Typography variant="body1" paragraph>
                    So why wait? Join Meet Your Mate today and discover a world of endless possibilities. Whether you're here to make friends, share stories, or find love, your journey starts here!
                </Typography>
                <Grid container spacing={2} style={{marginBottom:'3rem'}} justifyContent="center">
                    <Grid item>
                        <Link href="/auth/signup" passHref>
                            <Button variant="contained" color="primary">Sign up</Button>
                        </Link>
                    </Grid>
                    <Grid item>
                        <Link href="/auth/signin" passHref>
                            <Button variant="outlined" color="primary">Log in</Button>
                        </Link>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default AboutUsPage;
