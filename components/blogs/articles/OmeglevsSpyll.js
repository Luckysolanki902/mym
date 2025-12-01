import React from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography } from '@mui/material';
import Link from 'next/link';
import CustomHead from '@/components/seo/CustomHead';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';

const useStyles = makeStyles(() => ({
    root: {
        marginTop: '3rem',
        maxWidth: 1000,
        margin: 'auto',
    },
}));

const OmegleVsspyll = () => {
    const classes = useStyles();

    return (
        <>
            <CustomHead
                title={'Omegle vs. Spyll: Which Anonymous Chat Experience Wins?'}
                description={'Compare Omegle’s legacy random chat format with Spyll’s verified, college-only experience. Learn how Spyll keeps students safe with OTP signups, confession moderation, and audio-first innovation.'}
            />
            <Container className={classes.root}>
                <Typography variant="h3" gutterBottom>
                    Omegle vs. Spyll: A Comparative Analysis
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Introduction
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle popularized instant conversations with strangers, but it never solved the safety problems that eventually shut it down. Spyll—formerly known as spyll—was built deliberately for college students who want the thrill of anonymous chats without the chaos. Let’s break down how both experiences compare.
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Omegle in Retrospect
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle launched in 2009 and paired millions of strangers for text or video banter. It required no sign-up, which kept the barrier low but also opened the door for spam, explicit content, and impersonation. Reports of unmoderated abuse piled up, and in 2023 the founder voluntarily shut the product down, citing the impossibility of keeping users safe.
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Spyll: The College-Only Successor
                </Typography>
                <Link href={'https://spyll.in'} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h5" style={{ marginTop: '3rem' }}>Why students switch to Spyll</Typography>
                </Link>
                <Link href={'https://spyll.in'} style={{ textDecoration: 'none' }}>
                    <SpyllWordmark style={{ display: 'block', fontSize: '3rem', letterSpacing: '-2px', color: '#000000', margin: '1rem 0' }} />
                </Link>
                <Typography variant="body1" paragraph>
                    Spyll keeps the fun of anonymous discovery but layers in college email verification, OTP signups, and a moderation backlog measured in minutes rather than days. Every new user selects their campus, so you know your match actually shares the same lecture halls, fests, and inside jokes.
                </Typography>
                <Typography variant="body1" paragraph>
                    Once verified, you can jump into Random Chat queues (audio or text), drop a confession, or participate in themed pairing events. Recent updates added a speaker/earpiece toggle, adaptive timers that show how long you have been connected, and queue transparency so you know where you stand.
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Head-to-Head Comparison
                </Typography>

                <Typography variant="h5" style={{ marginTop: '1.5rem' }}>
                    1. Onboarding & Identity
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle: Zero onboarding, which meant bots and trolls everywhere.
                    <br />
                    Spyll: College email + OTP before you can even peek at the confessions feed.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '1.5rem' }}>
                    2. Safety & Moderation
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle: Report tools existed, but enforcement was slow and inconsistent.
                    <br />
                    Spyll: Automated filters, human reviewers, and contextual warnings if a conversation feels off.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '1.5rem' }}>
                    3. Feature Depth
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle: Basic text/video with zero continuity.
                    <br />
                    Spyll: Anonymous confessions, queue indicators, time-boxed chats, and even utility components such as Scroll-to-Top prompts built for long reads.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '1.5rem' }}>
                    4. Community Feel
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle: Entirely random; you rarely met someone from your own context.
                    <br />
                    Spyll: Hyper-local. You vent about professors, share lost-and-found stories, or ask for fest partners knowing the audience understands.
                </Typography>

                <Typography variant="h5" style={{ marginTop: '1.5rem' }}>
                    5. Data Handling
                </Typography>
                <Typography variant="body1" paragraph>
                    Omegle: Minimal data collection but also zero accountability for bad actors.
                    <br />
                    Spyll: Saves only what’s needed for moderation and wipes chat content once reports are resolved.
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Why Spyll Wins for Students
                </Typography>
                <Typography variant="body1" paragraph>
                    Spyll focuses on psychological safety. The UI nudges you to take breaks, the timer gently reminds you when to wrap conversations, and the SEO-backed blog (yes, including this very page) offers resources on building better online habits. That holistic outlook makes it far more than an Omegle clone.
                </Typography>

                <Typography variant="h4" style={{ marginTop: '2rem' }}>
                    Conclusion
                </Typography>
                <Typography variant="body1" paragraph>
                    If you miss the rush of talking to strangers but refuse to compromise on safety, Spyll is the logical upgrade. It keeps the spontaneity, filters out the noise, and anchors everything around real campuses. Visit <Link href={'https://spyll.in'} style={{ textDecoration: 'none', fontWeight: 600 }}>Spyll</Link> to see how the new experience feels.
                </Typography>
            </Container>
        </>
    );
};

export default OmegleVsspyll;
