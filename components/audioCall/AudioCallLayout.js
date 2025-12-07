import React from 'react';
import { AnimatePresence } from 'framer-motion';
import styles from './styles/AudioCallLayout.module.css';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';
import ControlsDock from './ControlsDock';
import AudioCallPairingStatus from './AudioCallPairingStatus';
import MicPermissionPrompt from './MicPermissionPrompt';
import CallTimer from './CallTimer';
import DisconnectMessage from './DisconnectMessage';
import CallEndedPrompt from './CallEndedPrompt';
import IdlePrompt from './IdlePrompt';
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
  const { callState, micStatus, isFindingPair, partnerDisconnected, userInitiatedEnd, partner, lastPartnerGender, callStartTime, remoteAudioRef, socket } = audioCallContext;

  // Redux for onboarding tour
  const dispatch = useDispatch();
  const isAudioCallTourCompleted = useSelector(selectIsTourCompleted('audioCall'));

  const showMicPrompt = micStatus !== MIC_STATE.GRANTED;
  
  // Priority-based UI states (mutually exclusive, ordered by priority)
  // 1. Active call timer - highest priority during connected call
  const showTimer = callState === CALL_STATE.CONNECTED && callStartTime;
  
  // 2. Finding/Connecting status - when actively searching or connecting
  const showPairingStatus = !showTimer && (isFindingPair || callState === CALL_STATE.DIALING || callState === CALL_STATE.CONNECTING);
  
  // 3. Partner disconnected message - ONLY when partner left (not user initiated)
  // partnerDisconnected is set by server's callEnded event to the NON-initiating user
  const showDisconnectMessage = !showTimer && !showPairingStatus && partnerDisconnected && !userInitiatedEnd;
  
  // 4. Call ended prompt - when USER initiated hangup OR when call ended without clear reason
  // This catches the case where call ends via PeerJS without explicit partnerDisconnected flag
  const showCallEndedPrompt = !showTimer && !showPairingStatus && !showDisconnectMessage && 
    (userInitiatedEnd || (callState === CALL_STATE.ENDED && !partnerDisconnected && !isFindingPair));
  
  // 5. Idle state - ready to start a call (mic granted, nothing else active)
  const showIdleState = !showMicPrompt && !showTimer && !showPairingStatus && !showDisconnectMessage && !showCallEndedPrompt && callState === CALL_STATE.IDLE;

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
              partnerGender={lastPartnerGender || partner?.gender}
              userGender={userDetails?.gender}
              onFindNew={controller.findNew}
            />
          ) : showCallEndedPrompt ? (
            <CallEndedPrompt
              key="call-ended-prompt"
              userGender={userDetails?.gender}
              onFindNew={controller.findNew}
            />
          ) : showIdleState ? (
            <IdlePrompt
              key="idle-prompt"
              userGender={userDetails?.gender}
              onStartCall={controller.findNew}
            />
          ) : showPairingStatus ? (
            <AudioCallPairingStatus
              key="pairing-status"
              userGender={userDetails?.gender}
              onlineCount={onlineCount}
            />
          ) : showTimer ? (
            <CallTimer
              key="call-timer"
              startTime={callStartTime}
              userGender={userDetails?.gender}
            />
          ) : null}
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
