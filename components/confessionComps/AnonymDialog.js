import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { TextField, Button } from '@mui/material';

const AnonymDialog = ({ open, onClose, handleAnonymousReply }) => {
    const [anonymousReplyValue, setAnonymousReplyValue] = useState('');

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Reply Anonymously</DialogTitle>
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
                    onClick={() => handleAnonymousReply(anonymousReplyValue)}
                    disabled={anonymousReplyValue.trim() === ''}
                    style={{ marginTop: '2rem', float: 'right' }}
                >
                    Send
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AnonymDialog;
