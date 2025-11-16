import React from 'react';
import styles from './styles/AudioCallLayout.module.css';
import { useAudioCall } from '@/context/AudioCallContext';
import DialerHero from './DialerHero';
import ControlsDock from './ControlsDock';
import StatusTray from './StatusTray';
import useAudioCallController from '@/hooks/useAudioCallController';

const AudioCallLayout = ({ userDetails }) => {
  const audioCallContext = useAudioCall();
  const controller = useAudioCallController({ userDetails, context: audioCallContext });
  const { pairingState, remoteAudioRef } = audioCallContext;

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
      <div className={styles.deck}>
        <StatusTray userDetails={userDetails} pairingState={pairingState} />
        <div className={styles.stage}>
          <DialerHero userDetails={userDetails} controller={controller} />
        </div>
        <div className={styles.controlsRegion}>
          <ControlsDock controller={controller} />
        </div>
      </div>
    </div>
  );
};

export default AudioCallLayout;
