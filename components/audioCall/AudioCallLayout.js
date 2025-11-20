import React from 'react';
import { AnimatePresence } from 'framer-motion';
import styles from './styles/AudioCallLayout.module.css';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';
import ControlsDock from './ControlsDock';
import AudioCallPairingStatus from './AudioCallPairingStatus';
import MicPermissionPrompt from './MicPermissionPrompt';
import AudioWaveform from './AudioWaveform';
import FilterOptions from '../chatComps/FilterOptions';
import useAudioCallController from '@/hooks/useAudioCallController';

const AudioCallLayout = ({ userDetails }) => {
  const audioCallContext = useAudioCall();
  const controller = useAudioCallController({ userDetails, context: audioCallContext });
  const { callState, micStatus, isFindingPair, remoteAudioRef } = audioCallContext;

  const showMicPrompt = micStatus !== MIC_STATE.GRANTED;
  const showWaveform = callState === CALL_STATE.CONNECTED || isFindingPair;
  const showPairingStatus = isFindingPair || callState === CALL_STATE.DIALING;

  return (
    <div className={styles.canvas} data-user-gender={userDetails?.gender || 'other'}>
      <audio
        ref={remoteAudioRef}
        className={styles.remoteAudio}
        autoPlay
        playsInline
        preload="auto"
        muted={false}
        aria-hidden="true"
      />
      
      {/* Filter Button - Top Right */}
      <div className={styles.filterPosition}>
        <FilterOptions 
          userDetails={userDetails}
          socket={audioCallContext.socket}
          isFindingPair={isFindingPair}
          hasPaired={false}
        />
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <AnimatePresence mode="wait">
          {showMicPrompt ? (
            <MicPermissionPrompt
              key="mic-prompt"
              onEnableMicrophone={controller.requestMicAccess}
              userGender={userDetails?.gender}
            />
          ) : (
            <>
              {showPairingStatus && (
                <AudioCallPairingStatus
                  key="pairing-status"
                  userGender={userDetails?.gender}
                />
              )}
              {showWaveform && (
                <AudioWaveform
                  key="waveform"
                  isActive={callState === CALL_STATE.CONNECTED}
                  userGender={userDetails?.gender}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Footer Controls */}
      <ControlsDock controller={controller} />
    </div>
  );
};

export default AudioCallLayout;
