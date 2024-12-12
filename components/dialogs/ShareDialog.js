import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Image from 'next/image';
import styled from '@emotion/styled';
import styles from './styles/sharedialog.module.css';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

const StyledCopyButton = styled(Button)({
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '2rem',
    padding: '0.5rem 1rem',

    ':hover': {
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
});

const ShareDialog = ({ open, onClose, shareLink }) => {
    const [copied, setCopied] = useState(false);
    const plainLink = 'https://www.meetyourmate.in/confession/' + shareLink;
    const encodedShareLink = encodeURIComponent(plainLink);

    // Ref to track if the dialog is open
    const isDialogOpenRef = useRef(open);

    // Function to handle closing the dialog
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        isDialogOpenRef.current = open;

        if (open) {
            // Push a new history state when the dialog opens
            window.history.pushState({ dialog: true }, '');

            // Define the popstate handler
            const handlePopState = (event) => {
                if (isDialogOpenRef.current) {
                    // If the dialog is open, close it
                    handleClose();
                }
            };

            // Add the popstate event listener
            window.addEventListener('popstate', handlePopState);

            // Cleanup function to remove the event listener when the dialog closes
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [open, handleClose]);

    const handleCopy = async () => {
        try {
            // Copy text to clipboard
            await navigator.clipboard.writeText(plainLink);
            // Set copied state to true
            setCopied(true);
            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy: ', error);
        }
    };

    const shareOnWhatsApp = () => {
        const shareDescription = encodeURIComponent("\n\nShh... Have you seen the latest anonymous confession on MyM?\n Click to dive in and spill your thoughts!");
        const whatsappURL = `https://api.whatsapp.com/send?text=${encodedShareLink}${shareDescription}`;
        window.open(whatsappURL, '_blank');
    };

    return (
        <Dialog open={open} onClose={handleClose} className={styles.main}>
            {/* Circular close icon at the top right */}
            <Button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    minWidth: 'unset',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }}
                aria-label="Close"
            >
                <CloseIcon />
            </Button>

            <DialogTitle sx={{ fontWeight: '600', fontSize: '2rem', marginBottom: '0' }}>Share</DialogTitle>
            <DialogContent style={{ padding: '3rem', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', marginBottom: '2rem' }}>
                    <Button
                        color="primary"
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', fontWeight: '600', fontFamily: 'Roboto' }}
                        className={styles.shareButton}
                        onClick={shareOnWhatsApp}
                    >
                        <Image
                            src={'/images/othericons/whatsapp.png'}
                            width={512 / 3}
                            height={512 / 3}
                            alt='whatsapp'
                            loading='eager'
                        />
                        Whatsapp
                    </Button>
                </div>
                <div className={styles.shareLink}>
                    <div className={styles.shareLinkText}>{plainLink}</div>
                    <div>
                        <StyledCopyButton
                            color='inherit'
                            onClick={handleCopy}
                            style={{ backgroundColor: copied ? 'gray' : 'black' }}
                            className={styles.copyBtnPc}
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </StyledCopyButton>
                    </div>
                </div>
                <div className={styles.linkButtonForSmallScreen}>
                    <StyledCopyButton
                        color='inherit'
                        className={styles.copyBtnSmall}
                        style={{ textTransform: 'uppercase', padding: '0.5rem 1rem', backgroundColor: copied ? 'gray' : 'black' }}
                        onClick={handleCopy}
                    >
                        <ContentCopyIcon style={{ marginRight: '1rem' }} />
                        {copied ? 'Copied' : ' Copy Link'}
                    </StyledCopyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
