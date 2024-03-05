import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const WarningDialog = ({ open, onClose, content }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle style={{ backgroundColor: '#2d2d2d', color: '#fff' }}>Content Moderation Warning</DialogTitle>
            <DialogContent style={{ padding: '20px' }}>
                <Typography variant="body1" gutterBottom>
                    <span style={{fontWeight:'800'}}>Problem: </span>  {content.warning}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <span style={{fontWeight:'800'}}>  Advice: </span>  {content.advice}
                </Typography>
                <h3 style={{ marginBottom: '0' }}>Problematic Sentences:</h3>
                <List>
                    {content?.problematicSentences?.map((sentence, index) => (
                        <div>
                            <p style={{ marginLeft: '1rem', color: '#b00000' }}>{sentence}</p>
                        </div>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    Okay
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WarningDialog;
