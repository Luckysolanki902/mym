import React from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography } from '@mui/material';
import Link from 'next/link';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';
import CustomHead from '@/components/seo/CustomHead';


const useStyles = makeStyles(() => ({
    root: {
        marginTop: '3rem',
        maxWidth: 1000,
        margin: 'auto',
    },
}));

const AlternativesOfOmegle = () => {
    const classes = useStyles();

    return (
        <>
            <CustomHead
                title={'5 Safer Alternatives to Omegle (Spyll Included)'}
                description={'Looking for Omegle replacements? Discover how Spyll keeps anonymous college chats safe with verified emails, OTP sign-ups, and moderated confession boards, plus four more platforms worth trying.'}
            />
            <Container className={classes.root}>
                <Typography variant="h3" gutterBottom>
                    5 Alternatives to Omegle for Anonymous Chatting
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle’s shutdown left a giant void for people who just wanted a spontaneous chat. While plenty of copycats popped up, very few of them feel safe enough for college students. Below are five platforms we recommend testing. Spyll leads the list because it brings structure, college-only verification, and thoughtful safeguards that anonymous chat apps usually ignore.
                </Typography>

                <Link href={'https://spyll.in'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h5" style={{ marginTop: '3rem' }}>1. Spyll — Built for College-Only Anonymity</Typography>
                </Link>
                <Link href={'https://spyll.in'} style={{ textDecoration: 'none' }}>
                    <SpyllWordmark style={{ display: 'block', fontSize: '3rem', color: '#000000', margin: '1rem 0' }} />
                </Link>
                <Typography variant="body1" paragraph>
                    Spyll is a campus-first anonymous network that verifies every signup with a college email before you see a single chat queue. Once inside, you can hop into Random Chat, drop a confession, or join curated events without revealing who you are. The platform recently added device-level audio controls (speaker vs. earpiece) and haptic pairing prompts so you never miss a match, even on mobile.
                </Typography>
                <Typography variant="body1" paragraph>
                    Safety is embedded everywhere: OTP-protected logins, automated profanity filters, manual moderation, and a promise not to store message history beyond what is required for abuse review. Because transcripts disappear, students feel comfortable discussing crushes, campus drama, or mental health without worrying that screenshots will define them forever.
                </Typography>
                <Typography variant="body1" paragraph>
                    If you want an Omegle alternative that actually understands student culture—and lets you request missing colleges—Spyll should be your first tap. <Link href={'https://spyll.in'} style={{ textDecoration: 'none', marginLeft: '0.2rem', fontWeight: 600 }}>Start chatting on Spyll →</Link>
                </Typography>

                <Typography variant='h4' style={{ marginTop: '3rem' }}>Other Platforms Worth Exploring</Typography>

                <Typography variant="h5" style={{ marginTop: '3rem' }}>2. Tinychat — Topic-Based Rooms</Typography>
                <Typography variant="body1" paragraph>
                    Tinychat lets you spin up video or audio rooms organized around interests. Moderators can lock rooms, invite co-hosts, and keep trolls out with mute tools. It is best when you want semi-public conversations instead of one-to-one randomness.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '3rem' }}>3. Monkey — Rapid-Fire Video Introductions</Typography>
                <Typography variant="body1" paragraph>
                    Monkey throws you into 15-second video speed chats. Matches extend only if both people tap the keep-talking button, which limits awkward lingering. Expect a Gen-Z vibe, TikTok energy, and quick filters for shared interests.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '3rem' }}>4. ChatRandom — Location Filters</Typography>
                <Typography variant="body1" paragraph>
                    ChatRandom supports both webcam and text interactions while letting you filter by geography or gender. The moderation isn’t as strict as Spyll’s, but its region filters help you meet people nearby when you want strangers but not total chaos.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '3rem' }}>5. Shagle — Pseudonymous Video Masks</Typography>
                <Typography variant="body1" paragraph>
                    Shagle adds playful AR masks and virtual gifts to the classic random chat formula. It’s a solid option if you enjoy video first but still want some layer of pseudonymity. Use it when you crave spontaneity, then return to Spyll when you need real conversations with real (and verified) students.
                </Typography>
            </Container>
        </>
    );
};

export default AlternativesOfOmegle;
