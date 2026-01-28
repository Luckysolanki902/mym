import React, { useState } from 'react';
import Head from 'next/head';
import { Container, Typography, TextField, Button } from '@mui/material';
import CryptoJS from 'crypto-js';

const ProtectAnonymityPage = () => {
    const [textToEncrypt, setTextToEncrypt] = useState('');
    const [encryptedText, setEncryptedText] = useState('');
    const [encryptionMessage, setEncryptionMessage] = useState('');
    const [encryptionMessage2, setEncryptionMessage2] = useState('');

    const handleEncrypt = () => {
        const encrypted = CryptoJS.AES.encrypt(textToEncrypt, 'secretkey').toString();
        setEncryptedText(encrypted);
        setEncryptionMessage("Your text has been securely encrypted. Try encrypting the same message again and notice how the encryption differs each time, providing enhanced security through unpredictability.");
        setEncryptionMessage2('Additionally, rest assured that your chat disappears as soon as you disconnect or close the browser, further ensuring your privacy and security.')
    };

    return (
        <div>
            <Head>
                <title>How We Protect Anonymity | Spyll</title>
                <meta name="description" content="Learn how Spyll protects anonymity using encryption." />
            </Head>

            <Container maxWidth="md" sx={{ paddingTop: 8 }}>

                <Typography variant="h2" gutterBottom>How We Protect Anonymity</Typography>
                <Typography variant="h4" gutterBottom>Chats</Typography>
                <Typography variant="body1" paragraph>
                    At Spyll, safeguarding your anonymity is paramount. Our commitment to your privacy extends beyond simple encryption – it's a four-tiered fortress of security. Enter your text below and witness a glimpse of this protective shield in action. While what you see here is a basic demonstration, rest assured that on Spyll, your messages undergo a rigorous four-way encryption process, ensuring unparalleled security.
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Text to Encrypt"
                    variant="outlined"
                    value={textToEncrypt}
                    onChange={(e) => setTextToEncrypt(e.target.value)}
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleEncrypt} sx={{ marginTop: 2 }}>
                    Encrypt
                </Button>
                {encryptedText && (
                    <div style={{ marginTop: '16px' }}>
                        <Typography variant="body1" gutterBottom>
                            Encrypted Text:
                        </Typography>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{encryptedText}</pre>
                        <Typography variant="body1" sx={{ color: 'green', marginTop: 1 }}>{encryptionMessage}</Typography>
                        <Typography variant="body1" sx={{ color: 'green', marginTop: 1 }}>{encryptionMessage2}</Typography>
                    </div>
                )}

                <Typography variant="h4" gutterBottom style={{marginTop:'4rem'}}>Confessions</Typography>
                <Typography variant="body1" paragraph>
                    Confessions on Spyll are a safe space for you to share your thoughts, experiences, and secrets anonymously. We understand the importance of privacy, which is why we've implemented measures to ensure your anonymity.
                </Typography>
                <Typography variant="body1" paragraph>
                    When you submit a confession, we don't store any personal information such as email addresses. The email notifications you receive is key-rotation-based automated server notifications. This means that even in the unlikely event of a data breach, your identity remains completely anonymous.
                </Typography>
                <Typography variant="body1" paragraph>
                    Additionally, our platform uses encryption to securely transmit and store confessions, further protecting your privacy. You can share your deepest thoughts with confidence, knowing that your identity is safeguarded every step of the way.
                </Typography>

            </Container>
        </div>
    );
};

export default ProtectAnonymityPage;
