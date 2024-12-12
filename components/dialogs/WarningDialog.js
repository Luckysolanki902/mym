import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, Typography } from '@mui/material';

const WarningDialog = ({ open, onClose, content }) => {
    return (
        <Dialog
            open={open}
            onClose={null} // Disable closing on background click
            maxWidth="sm"
            fullWidth
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            {/* <DialogTitle ]>Content Warning</DialogTitle> */}
            <DialogContent style={{ padding: '20px' }}>
                <Typography variant="body1" gutterBottom>
                    <span style={{ fontWeight: '400', fontFamily: 'Jost', fontSize: '1.1rem' }}>{content.warning}</span>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <span style={{ fontFamily: 'Jost', marginBottom: '1rem' }}>{content.advice}</span>
                </Typography>
                <span style={{ fontFamily: 'Jost', marginBottom: '1rem' }}>
                    Let's edit these lines a bit before hitting send.
                </span>
                {/* <Typography variant='h6' style={{ marginBottom: '0', fontFamily: 'Jost', fontWeight:'300' }}>Problematic Sentences:</Typography> */}
                <List>
                    {content?.problematicSentences?.map((sentence, index) => (
                        <div key={index}>
                            <p style={{ marginLeft: '1rem', color: '#b00000', fontFamily: 'Jost' }}>{sentence}</p>
                        </div>
                    ))}
                </List>
                
            </DialogContent>
            <DialogActions>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        paddingLeft: '1rem',
                    }}
                >
                    <Button onClick={onClose} variant="contained" color="primary" style={{ fontFamily: 'Jost' }}>
                        Okay
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default WarningDialog;
