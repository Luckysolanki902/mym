// components/commonComps/ExitConfirmationDialog.js
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

// StyledButton for the "Back" button based on user gender
const StyledButton = styled(Button)(({ userGender, theme }) => ({
    backgroundColor:
        userGender === 'male'
            ? 'rgba(83, 195, 255, 0.9)'
            : userGender === 'female'
                ? 'rgba(255, 115, 147, 0.91)'
                : 'rgba(45, 45, 45, 1)',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'capitalize',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    '&:hover': {
        backgroundColor:
            userGender === 'male'
                ? 'rgba(83, 195, 255, 0.8)'
                : userGender === 'female'
                    ? 'rgba(255, 115, 147, 0.8)'
                    : 'rgba(45, 45, 45, 0.95)',
        transform: 'scale(0.98)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '0.4rem 1.2rem',
        fontSize: '0.8rem',
    },
}));

/**
 * ExitConfirmationDialog Component
 *
 * Props:
 * - open (boolean): Controls whether the dialog is open.
 * - onConfirm (function): Callback when the user confirms to exit.
 * - onCancel (function): Callback when the user cancels the exit.
 * - userGender (string): Determines the styling of the "Back" button.
 */
const ExitConfirmationDialog = ({ open, onConfirm, onCancel, userGender }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="exit-dialog-title"
            fullWidth
            maxWidth="xs"
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    borderRadius: '1rem',
                    padding: theme.spacing(2),
                },
            }}
        >
            <DialogTitle
                id="exit-dialog-title"
                sx={{
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: theme.palette.text.primary,
                }}
            >
                Are You Sure You Want to Leave?
            </DialogTitle>
            <DialogContent>
                <Typography
                    variant="body1"
                    align="center"
                    sx={{ marginTop: theme.spacing(1), color: theme.palette.text.secondary }}
                >
                    Your current conversation will be lost if you leave now. Do you wish to proceed?
                </Typography>
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: 'center',
                    gap: theme.spacing(2),
                    marginTop: theme.spacing(2),
                }}
            >
                <StyledButton userGender={userGender} onClick={onConfirm}>
                    Back
                </StyledButton>
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    sx={{
                        color: 'darkgray',
                        borderColor: 'darkgray',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'capitalize',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                            borderColor: 'darkgray',
                            backgroundColor: 'rgba(0,0,0,0.04)',
                        },
                        [theme.breakpoints.down('sm')]: {
                            padding: '0.4rem 1.2rem',
                            fontSize: '0.8rem',
                        },
                    }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// PropTypes for type checking
ExitConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    userGender: PropTypes.string.isRequired,
};

export default ExitConfirmationDialog;
