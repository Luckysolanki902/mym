import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styled from '@emotion/styled';

const StyledDialogContent = styled(DialogContent)({
    padding: '3rem',
    borderRadius: '1.5rem',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)',
}); 

const StyledButton = styled(Button)(({ userGender }) => ({
    marginTop: '2rem',
    backgroundColor: userGender === 'male' ? 'rgba(83, 195, 255, 0.9)' : 'rgba(255, 115, 147, 0.91)',
    color: '#fff',
    padding: '0.9rem 2rem',
    borderRadius: '1rem',
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'capitalize',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: userGender === 'male' ? 'rgba(83, 175, 235, 0.8)' : 'rgba(255, 95, 127, 0.8)',
        transform: 'scale(0.98)',
    },
}));

const GuidelinesDialog = ({ open, onClose, userGender }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    maxWidth: '650px',
                },
            }}
        >
            <StyledDialogContent>
                <Typography
                    variant="h5"
                    gutterBottom
                    style={{ fontWeight: 800, color: '#2c3e50', marginBottom: '2rem' }}
                >
                    Guidelines to Follow
                </Typography>
  
                <div style={{
                    textAlign: 'left',
                    margin: '0 auto',
                    maxWidth: '520px',
                    color: '#555',
                    lineHeight: '1.9',
                    fontSize: '1.1rem',
                }}>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem' }}>
                        <strong>1. Be Real:</strong> Say what you feel, not what you think others want to hear. True words have power to touch hearts.
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem' }}>
                        <strong>2. Be Kind:</strong> Life is beautiful and is all about <span style={{ color: '#df2c7a' }}>love</span> and not hatred. Keep your words as gentle as your intentions.
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem' }}>
                        <strong>3. Respect Privacy:</strong> Avoid revealing personal details about yourself or others.
                    </Typography>
                </div>
                <StyledButton onClick={onClose} userGender={userGender}>
                    I understand
                </StyledButton>
            </StyledDialogContent>
        </Dialog>
    );
};

export default GuidelinesDialog;
