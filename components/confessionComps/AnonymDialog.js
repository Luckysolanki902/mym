import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField, Button, CircularProgress } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';

const AnonymDialog = ({ open, onClose, handleAnonymousReply, anonymousReplyValue, setAnonymousReplyValue }) => {
    const [sending, setSending] = useState(false);

    const handleSendReply = async () => {
        try {
            setSending(true);
            await handleAnonymousReply(anonymousReplyValue);
            setAnonymousReplyValue('');
            onClose();
        } catch (error) {
            console.error('Error sending anonymous reply:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} >
            <DialogTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                    <div>Reply Anonymously</div>
                    <Button onClick={onClose}>
                    <CloseRounded />
                    </Button>
                </div>
            </DialogTitle>
            <DialogContent>
                <TextField
                    multiline
                    rows={4}
                    fullWidth
                    autoFocus
                    variant="outlined"
                    placeholder="Type your anonymous reply here..."
                    style={{ marginTop: '0.1rem' }}
                    value={anonymousReplyValue}
                    onChange={(e) => setAnonymousReplyValue(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendReply}
                    disabled={anonymousReplyValue.trim() === ''}
                    style={{ marginTop: '2rem', float: 'right' }}
                >
                    {sending ? <CircularProgress size={24} color="inherit" /> : 'Send'}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AnonymDialog;
