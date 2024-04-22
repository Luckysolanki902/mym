import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

const WarningDialog = ({ open, onClose, content }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <DialogTitle style={{ fontFamily: 'Courgette' }}>Content Warning</DialogTitle>
            <DialogContent style={{ padding: '20px' }}>
                <Typography variant="body1" gutterBottom>
                    <span style={{ fontWeight: '500', fontFamily: 'Courgette', fontSize: '1.1rem' }}>{content.warning} </span >
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <span style={{ fontFamily: 'Courgette', marginBottom: '1rem' }}>{content.advice} </span>
                </Typography>
                <h3 style={{ marginBottom: '0', fontFamily: 'Courgette' }}>Problematic Sentences:</h3>
                <List>
                    {content?.problematicSentences?.map((sentence, index) => (
                        <div>
                            <p style={{ marginLeft: '1rem', color: '#b00000', fontFamily: 'Courgette' }}>{sentence}</p>
                        </div>
                    ))}
                </List>
                <span style={{ fontFamily: 'Courgette', marginBottom: '1rem' }}>
                    let's edit those lines a bit before hitting send
                </span>

            </DialogContent>
            <DialogActions>
                <div style={{display:'flex', justifyContent:'flex-start', alignItems:'center', width:'100%', paddingLeft:'1rem'}}>
                <Button onClick={onClose} variant="contained" color="primary" style={{ fontFamily: 'Courgette' }}>
                    Okay
                </Button>

                </div>
            </DialogActions>
        </Dialog>
    );
};

export default WarningDialog;
