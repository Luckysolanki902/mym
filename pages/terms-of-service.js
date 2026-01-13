import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';

const TermsOfService = () => {
    const lastUpdated = 'January 14, 2026';

    return (
        <>
            <Head>
                <title>Terms of Service | Spyll - India&apos;s Anonymous College Network</title>
                <meta name="description" content="Spyll Terms of Service - Read our terms and conditions for using India's anonymous college network for verified students." />
                <meta name="robots" content="index,follow" />
                <link rel="canonical" href="https://spyll.in/terms-of-service" />
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
                            Terms of Service
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Last Updated: {lastUpdated}
                        </Typography>
                    </Box>

                    {/* Introduction */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            Welcome to Spyll! These Terms of Service (&quot;Terms&quot;) govern your use of the Spyll mobile application and website (collectively, the &quot;Service&quot;) operated by Spyll (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 1 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            1. Eligibility
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            To use Spyll, you must:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Be at least 18 years of age" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Be a currently enrolled college/university student in India" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Have a valid college email address for verification" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Agree to these Terms of Service and our Privacy Policy" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 2 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            2. Account & Verification
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            Spyll uses college email verification to ensure all users are genuine students. By verifying:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• You confirm you are a real college student" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• You gain access to all features including chat, voice calls, and confessions" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Your email is used only for verification and important notifications." />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 3 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            3. Acceptable Use Policy
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            You agree NOT to use Spyll to:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Harass, bully, threaten, or intimidate other users" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Post or share sexually explicit, violent, or illegal content" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Impersonate others or misrepresent your identity" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Share personal information of others without consent" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Spam, advertise, or solicit other users" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Attempt to hack, disrupt, or interfere with the Service" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Use automated bots or scripts" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Violate any applicable laws or regulations" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 4 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            4. Content Guidelines
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            When posting confessions or communicating with others:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Be respectful and considerate" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Do not post hate speech, discrimination, or targeted harassment" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Do not share content that promotes self-harm or suicide" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Do not post false information intended to harm others" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Report any content that violates these guidelines" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 5 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            5. Anonymity & Responsibility
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            While Spyll provides anonymity, you are still responsible for your actions:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Anonymity is a privilege, not a right to harm others" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Illegal activities will be reported to appropriate authorities" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• We may cooperate with law enforcement for serious violations" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Severe violations may result in permanent bans" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 6 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            6. Intellectual Property
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            The Service and its original content (excluding user content), features, and functionality are owned by Spyll and are protected by international copyright, trademark, and other intellectual property laws.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 7 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            7. Termination
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We may terminate or suspend your access immediately, without prior notice, for any reason, including:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="• Breach of these Terms" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Reports from other users" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• Suspected fraudulent or illegal activity" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="• At our sole discretion for any reason" />
                            </ListItem>
                        </List>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 8 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            8. Disclaimer
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            The app might have glithes and bugs due to its early development stage. Rest assured, the security is never compromised and is robustly tested and hack-proof.
                            </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 9 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            9. Limitation of Liability
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPYLL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 10 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            10. Governing Law
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kanpur, Uttar Pradesh, India.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 11 */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            11. Changes to Terms
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                            We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Contact Section */}
                    <Box sx={{ textAlign: 'center', mt: 5, p: 4, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                            Contact Us
                        </Typography>
                        <Typography variant="body1" paragraph>
                            If you have any questions about these Terms, please contact us:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Email: contact@spyll.in
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            Website: https://spyll.in
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
                            <Link href="/" passHref style={{ textDecoration: 'none' }}>
                                <Typography 
                                    component="span" 
                                    sx={{ 
                                        color: '#FF5973', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'none' }
                                    }}
                                >
                                    ← Back to Home
                                </Typography>
                            </Link>
                            <Link href="/privacy-policy" passHref style={{ textDecoration: 'none' }}>
                                <Typography 
                                    component="span" 
                                    sx={{ 
                                        color: '#FF5973', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Privacy Policy →
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default TermsOfService;
