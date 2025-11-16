import React from 'react';
import styles from './styles/ControlsDock.module.css';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useAudioCall, CALL_STATE } from '@/context/AudioCallContext';

const ControlsDock = ({ controller = {} }) => {
  const { callState, isMuted, speakerEnabled, isFindingPair, micStatus } = useAudioCall();
  const { toggleMute, toggleSpeaker, skip, findNew, hangup, requestMicAccess } = controller;

  const isActiveCall = callState === CALL_STATE.CONNECTED || callState === CALL_STATE.DIALING;
  const canSkip = typeof skip === 'function' && !isFindingPair && micStatus === 'GRANTED';
  const canFindNew = typeof findNew === 'function' && !isFindingPair;
  const canHang = typeof hangup === 'function' && isActiveCall;

  const handleMuteToggle = () => {
    if (typeof toggleMute === 'function') {
      toggleMute();
    }
  };

  const handleSpeakerToggle = () => {
    if (typeof toggleSpeaker === 'function') {
      toggleSpeaker();
    }
  };

  const handleHangup = () => {
    if (canHang) {
      hangup();
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      skip();
    } else if (typeof findNew === 'function' && !isFindingPair) {
      findNew();
    }
  };

  const handleFindNew = () => {
    if (canFindNew) {
      findNew();
    } else if (typeof requestMicAccess === 'function') {
      requestMicAccess();
    }
  };

  const controls = [
    {
      id: 'mute',
      label: isMuted ? 'Unmute' : 'Mute',
      icon: isMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />,
      onClick: handleMuteToggle,
    },
    {
      id: 'speaker',
      label: speakerEnabled ? 'Speaker off' : 'Speaker on',
      icon: speakerEnabled ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />,
      onClick: handleSpeakerToggle,
    },
    {
      id: 'skip',
      label: 'Skip',
      icon: <SkipNextRoundedIcon />,
      onClick: handleSkip,
    },
    {
      id: 'find-new',
      label: 'Find New',
      icon: <RefreshRoundedIcon />,
      onClick: handleFindNew,
    },
  ];

  return (
    <div className={styles.dockCard}>
      <div className={styles.controlsRow}>
        {controls.map((control) => (
          <button
            key={control.id}
            type="button"
            onClick={control.onClick}
            className={`${styles.controlButton} ${styles.controlButtonSecondary}`}
            aria-label={control.label}
            aria-pressed={control.id === 'mute' ? isMuted : control.id === 'speaker' ? speakerEnabled : undefined}
            disabled={
              (control.id === 'skip' && !canSkip) ||
              (control.id === 'find-new' && !canFindNew && typeof requestMicAccess !== 'function')
            }
          >
            {control.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={handleHangup}
          className={`${styles.controlButton} ${styles.controlButtonPrimary}`}
          aria-label="Hang up"
          disabled={!canHang}
        >
          <CallEndRoundedIcon />
        </button>
      </div>
    </div>
  );
};

export default ControlsDock;
