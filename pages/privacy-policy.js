import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Box, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
    Security,
    Lock,
    DeleteForever,
    VerifiedUser,
    Shield,
    Email,
    Storage,
    Visibility,
    Report,
    Update
} from '@mui/icons-material';

const PrivacyPolicy = () => {
    const lastUpdated = 'January 14, 2026';

    return (
        <>
            <Head>
                <title>Privacy Policy | Spyll - India&apos;s Anonymous College Network</title>
                <meta name="description" content="Spyll Privacy Policy - Learn how we protect your data and maintain your anonymity. We don't store chats, use end-to-end encryption, and never share personal information." />
                <meta name="robots" content="index,follow" />
                <link rel="canonical" href="https://spyll.in/privacy-policy" />
            </Head>

            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #fafafa 0%, #fff 100%)',
                        border: '1px solid #eee'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#1a1a1a',
                                mb: 2,
                                fontSize: { xs: '1.75rem', md: '2.5rem' }
                            }}
                        >
                            Privacy Policy
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Last Updated: {lastUpdated}
                        </Typography>
                    </Box>

                    {/* Introduction */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            Welcome to Spyll (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the &quot;Service&quot;).
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            Spyll is India&apos;s anonymous college network that allows verified students to connect, chat, make voice calls, and share confessions while maintaining complete anonymity. <strong>Your privacy is our top priority.</strong>
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 1: Information We Collect */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Storage sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                1. Information We Collect
                            </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                            1.1 Information You Provide
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><Email sx={{ color: '#FF5973' }} /></ListItemIcon>
                                <ListItemText
                                    primary="College Email Address"
                                    secondary="Is never revealed and is used for verification and notification purposes (auto triggered)."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><VerifiedUser sx={{ color: '#FF5973' }} /></ListItemIcon>
                                <ListItemText
                                    primary="Gender"
                                    secondary="Used for matching preferences."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Shield sx={{ color: '#FF5973' }} /></ListItemIcon>
                                <ListItemText
                                    primary="College/University Name"
                                    secondary="Used for college-based matching"
                                />
                            </ListItem>
                        </List>

                        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                            1.2 Information We DO NOT Collect
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="❌ Your real name or identity" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="❌ Phone numbers" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="❌ Chat messages" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="❌ Voice call recordings" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="❌ Location data" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="❌ Contact lists" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 2: How We Use Your Information */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Visibility sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                2. How We Use Your Information
                            </Typography>
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We use the limited information we collect to:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Verify you are a genuine college student" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Match you with other verified students based on your preferences" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Display anonymous confessions from your college or all colleges" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Ensure platform safety and prevent abuse" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Send important service notifications (push notifications, if enabled)" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 3: Data Security & Encryption */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Lock sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                3. Data Security & Encryption
                            </Typography>
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We implement industry-leading security measures to protect your data:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><Security sx={{ color: '#4CAF50' }} /></ListItemIcon>
                                <ListItemText
                                    primary="End-to-End Encryption (AES-256)"
                                    secondary="All chat messages are encrypted using AES-256 encryption. Only you and your chat partner can read them."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Shield sx={{ color: '#4CAF50' }} /></ListItemIcon>
                                <ListItemText
                                    primary="Browser-Only Chat Storage"
                                    secondary="Chats exist only in your browser's memory during the session. Nothing is transmitted to or stored on our servers or database."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Lock sx={{ color: '#4CAF50' }} /></ListItemIcon>
                                <ListItemText
                                    primary="Secure Infrastructure"
                                    secondary="Our servers use HTTPS/TLS encryption, secure authentication, and are hosted on industry-standard cloud infrastructure."
                                />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 4: Anonymous Confessions */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Shield sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                4. Anonymous Confessions
                            </Typography>
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            When you post a confession:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Your identity is NEVER attached to the confession" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• We only store: confession text, college name, gender, and timestamp" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Confessions are encrypted before storage" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• We have no way to trace a confession back to you" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• You can request deletion of your confessions" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 5: Third-Party Services */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            5. Third-Party Services
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We use the following third-party services:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Google Analytics"
                                    secondary="To understand how users interact with our platform (anonymized data only)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Firebase Cloud Messaging"
                                    secondary="For push notifications (device tokens only, no personal data)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Cloudflare"
                                    secondary="For security and performance optimization"
                                />
                            </ListItem>
                        </List>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                            We do NOT sell, trade, or share your personal information with advertisers or data brokers.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 6: Data Retention */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <DeleteForever sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                6. Data Retention
                            </Typography>
                        </Box>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Chat Messages"
                                    secondary="Not stored in database. Only user to user via socket.io."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Voice Calls"
                                    secondary="Not recorded."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Confessions"
                                    secondary="Retained until you request deletion"
                                />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 7: Your Rights */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            7. Your Rights
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            You have the right to:
                        </Typography>
                        <List>
                            <ListItemText
                                primary="• Request deletion of a confession - If a confession (posted by you or another user) affects you, or was posted by mistake, you may request its removal. Please include a valid reason to help us review your request."
                            />
                            <ListItem>
                                <ListItemText primary="• Opt-out - Disable push notifications at any time" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Report violations - Report any privacy concerns or violations" />
                            </ListItem>
                        </List>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                            To exercise any of these rights, contact us at <strong>contact@spyll.in</strong>
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 8: Children's Privacy */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            8. Children&apos;s Privacy
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            Spyll is intended for college students aged 18 and above. We do not knowingly collect or solicit personal information from anyone under 18 years of age. If we learn that we have collected personal information from a child under 18, we will delete that information immediately. If you believe a child under 18 has provided us with personal information, please contact us at contact@spyll.in.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 9: Community Guidelines */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Report sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                9. Community Guidelines & Safety
                            </Typography>
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            While we protect your anonymity, we have zero tolerance for:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Harassment, bullying, or hate speech" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Sharing explicit or illegal content" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Impersonation or fraud" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Spam or commercial solicitation" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Any activity that violates Indian law" />
                            </ListItem>
                        </List>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                            Violations may result in temporary or permanent bans. Report any concerns using the in-app report feature.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 10: Changes to This Policy */}
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Update sx={{ mr: 1, color: '#FF5973' }} />
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                10. Changes to This Policy
                            </Typography>
                        </Box>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Contact Section */}
                    <Box sx={{ textAlign: 'center', mt: 5, p: 4, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            Contact Us
                        </Typography>
                        <Typography variant="body1" paragraph>
                            If you have any questions about this Privacy Policy, please contact us:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Email: contact@spyll.in
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            Website: <Link href="https://spyll.in" target="_blank" rel="noopener noreferrer">https://spyll.in</Link >
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Link href="/" style={{textDecoration: 'none'}} passHref>
                                <Typography
                                    component="span"
                                    sx={{
                                        color: '#FF5973',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ← Back to Home
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default PrivacyPolicy;
