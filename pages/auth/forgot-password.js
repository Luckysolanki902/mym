import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "@/firebase";
import { createTheme, ThemeProvider, Select, MenuItem, TextField, Button, CircularProgress, InputLabel } from '@mui/material';
import Image from 'next/image';
import styles from './signup.module.css'

const mymtheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: 'rgb(45, 45, 45)',
        },
    },
});

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sendingEmailAgain, setSendingEmailAgain] = useState(false);

    const resetEmail = () => {
        setLoading(true);
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setEmailSent(true);
            })
            .catch((error) => {
                console.error("Error sending password reset email:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleResend = () => {
        setEmailSent(false);
        setSendingEmailAgain(true)
        // setEmail('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        resetEmail();
    };

    return (
        <ThemeProvider theme={mymtheme}>
            <div className={styles.mainContainer}>
                <div className={styles.mainBox}>
                    <Image src={'/images/mym_logos/mymshadow.png'} width={1232} height={656} alt='mym' className={styles.mymLogo}></Image>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!emailSent && (
                            <TextField
                                type="email"
                                label="College Id"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant='standard'
                                InputLabelProps={{
                                    required: false,
                                }}
                                className={styles.input}
                            />
                        )}

                        {loading ? (
                            <CircularProgress style={{ marginTop: '20px' }} />
                        ) : (
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={styles.button}
                                onClick={resetEmail}
                                disabled={loading || emailSent}
                            >
                                {!sendingEmailAgain ? 'Send Reset Link' : 'Send Reset Link Again'}
                            </Button>
                        )}
                    </form>
                    {emailSent && (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <div
                                style={{ padding: '1rem', fontFamily: 'Jost', fontSize: '0.8rem', marginTop: '20px', color: 'green' }} className={styles.paraLink}>
                                Password reset email sent successfully!
                            </div>
                            <div className={styles.line}></div>
                            <div href="/auth/signin" className={styles.paraLink}>
                                Didn't receive the link?
                            </div>
                            <Button
                                type="submit"
                                variant="text"
                                color="primary"
                                onClick={handleResend}
                                className={`${styles.button} ${styles.button2}`}
                            >
                                {'Send Again'}
                            </Button>
                        </div>

                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}
