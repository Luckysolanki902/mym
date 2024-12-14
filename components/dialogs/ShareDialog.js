import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Image from 'next/image';
import styled from '@emotion/styled';
import styles from './styles/sharedialog.module.css';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const StyledCopyButton = styled(Button)({
    backgroundColor: '#6200ea',
    color: '#fff',
    borderRadius: '1rem',
    padding: '0.6rem 1.2rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease-in-out',
    ':hover': {
        backgroundColor: '#4a00b4',
    },
});

const CloseButton = styled(Button)({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    minWidth: 'unset',
    padding: '0.3rem',
    borderRadius: '50%',
    // backgroundColor: '#f5f5f5',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    ':hover': {
        backgroundColor: '#e0e0e0',
    },
});

const ShareDialog = ({ open, onClose, shareLink, confessorGender }) => {
    const [copied, setCopied] = useState(false);
    const plainLink = 'https://www.meetyourmate.in/confession/' + shareLink;
    const encodedShareLink = encodeURIComponent(plainLink);

    const isDialogOpenRef = useRef(open);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        isDialogOpenRef.current = open;

        if (open) {
            window.history.pushState({ dialog: true }, '');

            const handlePopState = () => {
                if (isDialogOpenRef.current) {
                    handleClose();
                }
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [open, handleClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(plainLink);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const shareOnWhatsApp = () => {
        const shareDescription = encodeURIComponent("\n\nShh... Have you seen the latest anonymous confession on MyM?\n Click to dive in and spill your thoughts!");
        const whatsappURL = `https://api.whatsapp.com/send?text=${encodedShareLink}${shareDescription}`;
        window.open(whatsappURL, '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: {
                    borderRadius: '1.5rem',
                    padding: '1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    width: '90%',
                    maxWidth: '400px',
                },
            }}
        >
            <CloseButton onClick={handleClose} aria-label="Close">
                <CloseIcon />
            </CloseButton>

            <DialogTitle
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    color: '#333',
                }}
            >
                Share
            </DialogTitle>
            <DialogContent
                style={{
                    padding: '2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                }}
            >
                <Button
                    color="primary"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                        fontFamily: 'Roboto',
                        textTransform: 'none',
                    }}
                    onClick={shareOnWhatsApp}
                >
                    <Image
                        src="/images/othericons/whatsapp.png"
                        width={64}
                        height={64}
                        alt="WhatsApp"
                        loading="eager"
                    />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>WhatsApp</span>
                </Button>

                <div
                    style={{
                        fontFamily: 'Roboto',
                        fontSize: '0.85rem',
                        backgroundColor: '#f9f9f9',
                        padding: '0.8rem 1.2rem',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        overflowX: 'auto',
                        gap: '1rem',
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {plainLink}
                    </span>
                    <StyledCopyButton
                        onClick={handleCopy}
                        style={{
                            backgroundColor: copied ? '#ccc' : (confessorGender === 'male' ? 'rgba(83, 195, 255, 0.9)' : 'rgba(255, 115, 147, 0.91)'),
                        }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </StyledCopyButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareDialog;
