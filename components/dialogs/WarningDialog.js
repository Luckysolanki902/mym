import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, List } from '@mui/material';

const WarningDialog = ({ open, onClose, content }) => {
    return (
        <Dialog
            open={open}
            onClose={null} // Disable closing on background click
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                },
            }}
            BackdropProps={{
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                },
            }}
        >
            <DialogContent
                style={{
                    padding: '2.5rem',
                    backgroundColor: '#ffffff',
                    textAlign: 'center',
                    borderRadius: '1.5rem',
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    style={{
                        fontWeight: 700,
                        color: '#2c3e50',
                        marginBottom: '1.5rem',
                    }}
                >
                    Let's Keep it Kind
                </Typography>
                <Typography
                    variant="body1"
                    style={{
                        fontSize: '1.1rem',
                        color: '#4f4f4f',
                        marginBottom: '1rem',
                        lineHeight: '1.8',
                    }}
                >
                    "Every word we share has the power to heal or hurt. Let’s choose love over hate."
                </Typography>
                <Typography
                    variant="body1"
                    style={{
                        fontSize: '1.1rem',
                        color: '#4f4f4f',
                        marginBottom: '1.5rem',
                        lineHeight: '1.8',
                    }}
                >
                    Before sending, let’s take a moment to ensure our message reflects kindness, understanding, and positivity.
                </Typography>
                <Typography
                    variant="h6"
                    style={{
                        fontWeight: 600,
                        color: '#b00000',
                        marginBottom: '1rem',
                    }}
                >
                    Review these flagged parts:
                </Typography>
                <List>
                    {content?.problematicSentences?.map((sentence, index) => (
                        <Typography
                            key={index}
                            style={{
                                marginLeft: '1rem',
                                color: '#b00000',
                                fontFamily: 'Jost',
                                fontSize: '1rem',
                            }}
                        >
                            {sentence}
                        </Typography>
                    ))}
                </List>
            </DialogContent>
            <DialogActions style={{ padding: '1rem 2rem' }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    style={{
                        backgroundColor: '#6200ea',
                        color: '#fff',
                        padding: '0.8rem 2rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'capitalize',
                    }}
                >
                    Got it!
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WarningDialog;
