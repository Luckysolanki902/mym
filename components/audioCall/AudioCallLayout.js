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
import { useDispatch, useSelector } from 'react-redux';
import OnboardingTour from '../commonComps/OnboardingTour';
import { audioCallTourSteps } from '@/config/tourSteps';
import { startTour, selectIsTourCompleted } from '@/store/slices/onboardingSlice';

const AudioCallLayout = ({ userDetails }) => {
  const [onlineCount, setOnlineCount] = React.useState(0);
  const filterOpenRef = React.useRef(null);
  const tourStartedRef = React.useRef(false);
  const audioCallContext = useAudioCall();
  const controller = useAudioCallController({ userDetails, context: audioCallContext });
  const { callState, micStatus, isFindingPair, partnerDisconnected, partner, callStartTime, remoteAudioRef, socket } = audioCallContext;

  // Redux for onboarding tour
  const dispatch = useDispatch();
  const isAudioCallTourCompleted = useSelector(selectIsTourCompleted('audioCall'));

  const showMicPrompt = micStatus !== MIC_STATE.GRANTED;
  const showDisconnectMessage = partnerDisconnected && !isFindingPair;
  const showTimer = callState === CALL_STATE.CONNECTED && callStartTime;
  const showPairingStatus = (isFindingPair || callState === CALL_STATE.DIALING || callState === CALL_STATE.CONNECTING) && !partnerDisconnected;

  // Listen for socket-based online count updates
  React.useEffect(() => {
    if (!socket) return;
    
    const handleOnlineCount = (data) => {
      // Handle both old format (number) and new format (object)
      const count = typeof data === 'object' ? data.audioCall : data;
      setOnlineCount(count || 0);
    };
    
    socket.on('roundedUsersCount', handleOnlineCount);
    
    return () => {
      socket.off('roundedUsersCount', handleOnlineCount);
    };
  }, [socket]);

  // Fallback: Fetch online count periodically if socket count is 0
  React.useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';
    const fetchOnlineCount = async () => {
      try {
        const response = await fetch(`${serverUrl.endsWith('/') ? serverUrl + 'api/user-stats' : serverUrl + '/api/user-stats'}`);
        if (response.ok) {
          const data = await response.json();
          const count = data.audioCallStats?.totalUsers || 0;
          // Only update if we have a count from API (socket didn't provide one)
          if (count > 0) {
            setOnlineCount(prev => prev === 0 ? count : prev);
          }
        }
      } catch (error) {
        console.error('Error fetching online count:', error);
      }
    };
    
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 5000); // Reduced frequency since socket handles most updates
    return () => clearInterval(interval);
  }, []);

  // Start onboarding tour for first-time visitors (after mic is granted, always show in debug mode)
  const isDebugMode = process.env.NEXT_PUBLIC_NODE_ENV === 'debug';
  React.useEffect(() => {
    // Prevent re-triggering if already started
    if (tourStartedRef.current) return;
    
    const shouldShowTour = userDetails && (isDebugMode || !isAudioCallTourCompleted) && micStatus === MIC_STATE.GRANTED;
    
    if (shouldShowTour) {
      tourStartedRef.current = true;
      const timer = setTimeout(() => {
        dispatch(startTour('audioCall'));
      }, 1500); // Longer delay for audio call page to stabilize
      return () => clearTimeout(timer);
    }
  }, [userDetails, isAudioCallTourCompleted, micStatus, dispatch, isDebugMode]);

  // Reset tour started ref when component unmounts or tour completes
  React.useEffect(() => {
    return () => {
      tourStartedRef.current = false;
    };
  }, []);

  // Handle tour step changes
  const handleTourStepChange = (stepIndex, step) => {
    if (!filterOpenRef.current) return;
    
    if (step.action === 'open-filter') {
      filterOpenRef.current.open();
    } else if (step.action === 'close-filter') {
      filterOpenRef.current.close();
    }
  };

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
      <div className={styles.filterPosition} data-tour="call-filter-button">
        <FilterOptions 
          userDetails={userDetails}
          socket={audioCallContext.socket}
          isFindingPair={isFindingPair}
          hasPaired={false}
          filterOpenRef={filterOpenRef}
          onlineCount={onlineCount}
          pageType="audiocall"
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
              onFindNew={controller.findNew}
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

      {/* Onboarding Tour */}
      <OnboardingTour
        tourName="audioCall"
        steps={audioCallTourSteps}
        onStepChange={handleTourStepChange}
        onComplete={() => {
          if (filterOpenRef.current) {
            filterOpenRef.current.close();
          }
        }}
        onSkip={() => {
          if (filterOpenRef.current) {
            filterOpenRef.current.close();
          }
        }}
      />
    </div>
  );
};

export default AudioCallLayout;
