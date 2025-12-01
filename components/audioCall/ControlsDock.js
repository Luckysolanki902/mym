import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/ControlsDock.module.css';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import HeadsetRoundedIcon from '@mui/icons-material/HeadsetRounded';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';

const ControlsDock = ({ controller = {} }) => {
  const { callState, isMuted, speakerEnabled, isFindingPair, micStatus } = useAudioCall();
  const { toggleMute, toggleSpeaker, findNew, hangup } = controller;

  const isActiveCall = callState === CALL_STATE.CONNECTED || callState === CALL_STATE.DIALING;
  const isIdle = callState === CALL_STATE.IDLE || callState === CALL_STATE.ENDED;
  const canInteract = micStatus === MIC_STATE.GRANTED;

  // Haptic feedback function
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // Short haptic feedback
    }
  };

  const handleMuteToggle = () => {
    if (typeof toggleMute === 'function' && canInteract) {
      triggerHaptic();
      toggleMute();
    }
  };

  const handleSpeakerToggle = () => {
    if (typeof toggleSpeaker === 'function' && canInteract) {
      triggerHaptic();
      toggleSpeaker();
    }
  };

  const handlePrimaryAction = () => {
    triggerHaptic();
    if (isActiveCall) {
      // Hangup (which works as skip)
      if (typeof hangup === 'function') {
        hangup('skip');
      }
    } else if (isIdle && canInteract) {
      // Start finding
      if (typeof findNew === 'function') {
        findNew();
      }
    }
  };

  return (
    <motion.div
      className={styles.dockContainer}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className={styles.controlsRow}>
        {/* Mute/Unmute */}
        <motion.button
          type="button"
          onClick={handleMuteToggle}
          className={`${styles.controlButton} ${isMuted ? styles.controlButtonActive : ''}`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          disabled={!canInteract || !isActiveCall}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
        </motion.button>

        {/* Primary Action Button - Hangup/Dial */}
        <motion.button
          type="button"
          onClick={handlePrimaryAction}
          className={`${styles.primaryButton} ${isActiveCall ? styles.hangupButton : styles.dialButton}`}
          aria-label={isActiveCall ? 'Hang up' : 'Find new'}
          disabled={!canInteract}
          whileTap={{ scale: 0.9 }}
          data-tour="start-call-button"
        >
          {isActiveCall ? <CallEndRoundedIcon /> : <CallRoundedIcon />}
        </motion.button>

        {/* Speaker/Earpiece */}
        <motion.button
          type="button"
          onClick={handleSpeakerToggle}
          className={`${styles.controlButton} ${speakerEnabled ? styles.controlButtonActive : ''}`}
          aria-label={speakerEnabled ? 'Earpiece' : 'Speaker'}
          disabled={!canInteract || !isActiveCall}
          whileTap={{ scale: 0.9 }}
        >
          {speakerEnabled ? <VolumeUpRoundedIcon /> : <HeadsetRoundedIcon />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ControlsDock;
