import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import styled from '@emotion/styled';

const StyledDialogContent = styled(DialogContent)({
    padding: '3rem',
    borderRadius: '1.5rem',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
}); 

const StyledButton = styled(Button)(({ userGender }) => ({
    marginTop: '2rem',
    background: userGender === 'male' 
        ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' 
        : 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
    color: '#fff',
    padding: '0.8rem 2.5rem',
    borderRadius: '2rem',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'capitalize',
    fontFamily: 'Quicksand, sans-serif',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
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
                    background: 'transparent',
                    boxShadow: 'none',
                },
            }}
        >
            <StyledDialogContent>
                <Typography
                    variant="h5"
                    gutterBottom
                    style={{ 
                        fontWeight: 700, 
                        color: '#2d3436', 
                        marginBottom: '2rem',
                        fontFamily: 'Quicksand, sans-serif'
                    }}
                >
                    Guidelines to Follow
                </Typography>
  
                <div style={{
                    textAlign: 'left',
                    margin: '0 auto',
                    maxWidth: '520px',
                    color: '#636e72',
                    lineHeight: '1.8',
                    fontSize: '1.05rem',
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 500
                }}>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem', fontFamily: 'inherit' }}>
                        <strong>1. Be Real:</strong> Say what you feel, not what you think others want to hear. True words have power to touch hearts.
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem', fontFamily: 'inherit' }}>
                        <strong>2. Be Kind:</strong> Life is beautiful and is all about <span style={{ color: '#e84393', fontWeight: 700 }}>love</span> and not hatred. Keep your words as gentle as your intentions.
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '1.2rem', fontFamily: 'inherit' }}>
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
