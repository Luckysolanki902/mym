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
        <Dialog open={open} onClose={onClose}
            PaperProps={{
                style: {
                    minHeight: '40vh',
                    width: 'calc(100% - 40px)',
                    borderRadius:'1rem'

                },
            }}
        >
            {/* <DialogTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>Reply Anonymously</div>
                    <Button onClick={onClose}>
                        <CloseRounded />
                    </Button>
                </div>
            </DialogTitle> */}
            <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
                <textarea
                
                    // multiline
                    // rows={4}
                    fullWidth
                    autoFocus
                    variant="standard"
                    placeholder="Share your thoughts, they’ll never know it’s you…"
                    style={{ marginTop: '0.1rem', border:'none', outline:'none', flex:1, fontFamily:'Roboto', fontSize:'1rem', color:'rgb(50, 50, 50)', resize:'none' }}
                    value={anonymousReplyValue}
                    onChange={(e) => setAnonymousReplyValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                        }
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendReply}
                    disabled={anonymousReplyValue.trim() === ''}
                    sx={{
                        marginTop: '1rem',width:'fit-content',
                        alignSelf: 'flex-end', textTransform:'none', backgroundColor:'rgb(60, 60, 60)', borderRadius:'0.655rem'}}                    
                >
                    {sending ? <CircularProgress size={24} color="inherit" /> : 'Send'}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AnonymDialog;
