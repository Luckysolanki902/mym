import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const WarningDialog = ({ open, onClose, content }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth style={{backgroundColor:'rgba(0,0,0,0.5)'}}>
            <DialogTitle style={{ backgroundColor: '#2d2d2d', color: '#fff', fontFamily:'David Libre' }}>Content Moderation Warning</DialogTitle>
            <DialogContent style={{ padding: '20px' }}>
                <Typography variant="body1" gutterBottom>
                    <span style={{fontWeight:'900', fontFamily:'David Libre', fontSize:'1.1rem'}}>{content.warning} </span >  
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <span style={{fontFamily:'David Libre'}}>{content.advice} </span>  
                </Typography>
                <h3 style={{ marginBottom: '0', fontFamily:'David Libre' }}>Problematic Sentences:</h3>
                <List>
                    {content?.problematicSentences?.map((sentence, index) => (
                        <div>
                            <p style={{ marginLeft: '1rem', color: '#b00000',fontFamily:'David Libre' }}>{sentence}</p>
                        </div>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary" style={{fontFamily:'David Libre'}}>
                    Okay
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WarningDialog;
