import React from 'react';
import { AnimatePresence } from 'framer-motion';
import styles from './styles/AudioCallLayout.module.css';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';
import ControlsDock from './ControlsDock';
import AudioCallPairingStatus from './AudioCallPairingStatus';
import MicPermissionPrompt from './MicPermissionPrompt';
import CallTimer from './CallTimer';
import DisconnectMessage from './DisconnectMessage';
import FilterOptions from '../chatComps/FilterOptions';
import useAudioCallController from '@/hooks/useAudioCallController';

const AudioCallLayout = ({ userDetails }) => {
  const [onlineCount, setOnlineCount] = React.useState(0);
  const audioCallContext = useAudioCall();
  const controller = useAudioCallController({ userDetails, context: audioCallContext });
  const { callState, micStatus, isFindingPair, partnerDisconnected, partner, callStartTime, remoteAudioRef, socket } = audioCallContext;

  const showMicPrompt = micStatus !== MIC_STATE.GRANTED;
  const showDisconnectMessage = partnerDisconnected && !isFindingPair;
  const showTimer = callState === CALL_STATE.CONNECTED && callStartTime;
  const showPairingStatus = (isFindingPair || callState === CALL_STATE.DIALING || callState === CALL_STATE.CONNECTING) && !partnerDisconnected;

  // Fetch online count periodically
  React.useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';
    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`${serverUrl.endsWith('/') ? serverUrl + 'api/user-stats' : serverUrl + '/api/user-stats'}`);
        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.audioCallStats?.totalUsers || 0);
        }
      } catch (error) {
        console.error('Error fetching online count:', error);
      }
    };
    
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 3000);
    return () => clearInterval(interval);
  }, []);

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
          ) : showDisconnectMessage ? (
            <DisconnectMessage
              key="disconnect-message"
              partnerGender={partner?.gender}
              userGender={userDetails?.gender}
            />
          ) : (
            <>
              {showPairingStatus && (
                <AudioCallPairingStatus
                  key="pairing-status"
                  userGender={userDetails?.gender}
                  onlineCount={onlineCount}
                />
              )}
              {showTimer && (
                <CallTimer
                  key="call-timer"
                  startTime={callStartTime}
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
