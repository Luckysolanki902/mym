// components/dialogs/GuidelinesDialog.js

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';

const GuidelinesDialog = ({ open, onClose }) => {
    const handleBackdropClick = (e) => {
        e.stopPropagation();
    }
    return (
        <Dialog open={open} onClose={onClose} onClick={handleBackdropClick}
        maxWidth={'md'} style={{ backgroundColor:'rgba(0,0,0,0.6)'}}
        >
            {/* <DialogTitle>Guidelines Before Creating a Confession</DialogTitle> */}
            <DialogContent
            style={{padding:'2rem'}}
            >
                <p style={{  fontSize: '1.1rem' }}>
                    We understand that confessions can be powerful expressions of emotion. Here are some guidelines to ensure a positive and respectful experience:
                </p>
                <ul>
                    <li style={{  fontSize: '1.1rem', marginBottom: '1rem' }}>Be mindful of the impact of your words on others. Everyone has feelings, and it's important to respect them.</li>
                    <li style={{  fontSize: '1.1rem', marginBottom: '1rem' }}>Share your thoughts in a constructive manner. Confessions made in anger or frustration may not lead to the desired outcome.</li>
                    <li style={{  fontSize: '1.1rem', marginBottom: '1rem' }}>Protect your privacy and the privacy of others. Avoid sharing personal information that could harm yourself or others.</li>
                    {/* <li style={{ fontFamily: 'Jost', fontSize: '1.1rem' }}>Choose your words wisely. Offensive language or derogatory remarks have no place here.</li> */}
                </ul>
                <Button onClick={onClose} variant="contained" color="primary" style={{ marginTop: '1rem' }}>
                    I Understand
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default GuidelinesDialog;
