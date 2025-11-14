import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styles from './styles/AudioCallDialer.module.css';
import { useAudioCallContext } from '@/context/AudioCallContext';
import { CALL_STATUS, PAIRING_STATE, DEFAULT_CALL_DESCRIPTION } from '@/utils/audioCall/constants';
import AudioFilterOptions from './AudioFilterOptions';
import AudioPairingStatus from './AudioPairingStatus';

const WAITING_STATES = new Set([
  PAIRING_STATE.FINDING,
  PAIRING_STATE.WAITING,
  PAIRING_STATE.MATCHED,
  PAIRING_STATE.RINGING
]);

const accentTokens = {
  male: '#0094d4',
  female: '#e3368d',
  other: '#6c5ce7'
};

const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const formatWait = (seconds) => {
  if (seconds === undefined || seconds === null) return '—';
  if (seconds >= 120) {
    return `${Math.round(seconds / 60)}m`;
  }
  if (seconds >= 60) {
    return '1m+';
  }
  return `${Math.max(0, Math.round(seconds))}s`;
};

const deriveStatusTitle = (pairingState, callStatus, partner) => {
  if (callStatus === CALL_STATUS.ACTIVE) {
    return partner?.mid ? `Live with ${partner.mid}` : 'Live call in progress';
  }

  if (partner?.mid && WAITING_STATES.has(pairingState)) {
    return `Setting up your call with ${partner.mid}`;
  }

  if (WAITING_STATES.has(pairingState)) {
    return 'Finding someone who matches your vibe';
  }

  if (pairingState === PAIRING_STATE.ENDED) {
    return 'Ready to meet someone new?';
  }

  return 'Start an anonymous audio chat';
};

const AudioCallDialer = ({ userDetails, lifecycle }) => {
  const {
    state: {
      pairingState,
      callStatus,
      queueMetrics,
      partner,
      isMuted,
      soundsEnabled,
      callDurationSeconds,
      error,
      remoteStream,
      localStream
    }
  } = useAudioCallContext();

  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);

  const realignStream = useCallback((element, stream) => {
    if (!element) return;
    if (!stream) {
      element.srcObject = null;
      return;
    }
    if (element.srcObject === stream) return;
    element.srcObject = stream;

    const playPromise = element.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    realignStream(remoteAudioRef.current, remoteStream);
  }, [realignStream, remoteStream]);

  useEffect(() => {
    realignStream(localAudioRef.current, localStream);
  }, [localStream, realignStream]);

  const isWaiting = WAITING_STATES.has(pairingState);
  const isActiveCall = callStatus === CALL_STATUS.ACTIVE;
  const isPreparingCall =
    callStatus === CALL_STATUS.READY || callStatus === CALL_STATUS.CONNECTING;
  const accent = accentTokens[userDetails?.gender] || accentTokens.other;

  const queueSummary = useMemo(() => {
    if (!queueMetrics.queueSize) return 'Waiting for companions';
    if (queueMetrics.queueSize === 1) return '1 listener online';
    return `${queueMetrics.queueSize} listeners online`;
  }, [queueMetrics.queueSize]);
  const waitSummary = useMemo(() => {
    if (queueMetrics.estimatedWait) {
      return `~${formatWait(queueMetrics.estimatedWait)} wait`;
    }
    return 'Instant when matched';
  }, [queueMetrics.estimatedWait]);

  const triggerHaptic = useCallback((pattern = 12) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const statusTitle = useMemo(
    () => deriveStatusTitle(pairingState, callStatus, partner),
    [callStatus, pairingState, partner]
  );

  const statusBadge = useMemo(() => {
    if (error) return { label: 'Connection issue', tone: 'error' };
    if (isActiveCall) return { label: 'Connected', tone: 'positive' };
    if (isPreparingCall) return { label: 'Connecting…', tone: 'neutral' };
    if (isWaiting) return { label: 'Searching…', tone: 'neutral' };
    return { label: 'Ready when you are', tone: 'idle' };
  }, [error, isActiveCall, isPreparingCall, isWaiting]);

  const statusDescription = useMemo(() => {
    if (error) return error;
    if (isWaiting) {
      return queueMetrics.filterDescription || DEFAULT_CALL_DESCRIPTION;
    }
    if (isActiveCall) {
      return 'You are live. Be kind, stay curious, and enjoy the conversation.';
    }
    return DEFAULT_CALL_DESCRIPTION;
  }, [error, isActiveCall, isWaiting, queueMetrics.filterDescription]);

  const primaryLabel = useMemo(() => {
    if (isActiveCall) {
      return 'Find Another Match';
    }
    if (isWaiting || isPreparingCall) {
      return 'Searching…';
    }
    return 'Start Listening';
  }, [isActiveCall, isPreparingCall, isWaiting]);

  const secondaryLabel = useMemo(() => {
    if (isActiveCall || isPreparingCall) {
      return 'End Call';
    }
    return 'Stop Search';
  }, [isActiveCall, isPreparingCall]);

  const primaryDisabled = (isWaiting || isPreparingCall) && !isActiveCall;
  const secondaryDisabled = !(isWaiting || isActiveCall || isPreparingCall);

  const handlePrimaryClick = async () => {
    triggerHaptic();
    if (isActiveCall) {
      lifecycle.hangUp('find-new');
      lifecycle.requestFindNew();
      return;
    }

    if (!isWaiting && !isPreparingCall) {
      await lifecycle.ensureLocalStream().catch(() => undefined);
      lifecycle.initiate();
    }
  };

  const handleSecondaryClick = () => {
    triggerHaptic();
    if (isActiveCall || isPreparingCall || pairingState === PAIRING_STATE.RINGING) {
      lifecycle.hangUp('user-end');
      return;
    }

    if (isWaiting) {
      lifecycle.stopFinding();
    }
  };

  const handleToggleMute = () => {
    triggerHaptic(8);
    lifecycle.setMuted(!isMuted);
  };
  const handleToggleSounds = () => {
    triggerHaptic(8);
    lifecycle.setSoundsEnabled(!soundsEnabled);
  };

  const partnerInitials = partner?.mid ? partner.mid.slice(0, 2).toUpperCase() : '??';

  return (
    <div className={styles.wrapper} data-user-gender={userDetails?.gender || 'other'}>
      <div className={styles.filterPos}>
        <AudioFilterOptions userDetails={userDetails} />
      </div>

      <div className={styles.content}>
        <section className={styles.heroCard}>
          <div className={styles.heroTopRow}>
            <span className={styles.queueBadge} style={{ color: accent }}>
              #{queueMetrics.position || 0} in queue
            </span>
            <span className={styles.userTag}>Listening as {userDetails?.mid || 'guest'}</span>
          </div>

          <div className={styles.heroBody}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatarHalo} style={{ borderColor: accent }}>
                <span className={styles.avatarInitials}>{partnerInitials}</span>
              </div>
              {partner?.gender && (
                <span className={styles.avatarMeta}>
                  {partner.gender === 'female' ? 'Girl connected' : partner.gender === 'male' ? 'Boy connected' : 'Partner joining'}
                </span>
              )}
            </div>
            <div className={styles.heroCopy}>
              <span className={`${styles.statusBadge} ${styles[statusBadge.tone]}`}>
                {statusBadge.label}
              </span>
              <h1 className={styles.heroTitle}>{statusTitle}</h1>
              <p className={styles.heroSubtitle}>{statusDescription}</p>
              {isActiveCall && (
                <p className={styles.heroTimer}>Connected • {formatDuration(callDurationSeconds)}</p>
              )}
            </div>
          </div>
          <div className={styles.statusStrip}>
            <span className={styles.statusChip}>{queueSummary}</span>
            <span className={styles.statusChip}>{waitSummary}</span>
          </div>
        </section>

        <AudioPairingStatus userGender={userDetails?.gender || 'other'} />

        <section className={styles.controls}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handlePrimaryClick}
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleSecondaryClick}
            disabled={secondaryDisabled}
          >
            {secondaryLabel}
          </button>
          <div className={styles.toggleRow}>
            <button type="button" className={styles.outlineButton} onClick={handleToggleMute}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button type="button" className={styles.outlineButton} onClick={handleToggleSounds}>
              {soundsEnabled ? 'Disable Tones' : 'Enable Tones'}
            </button>
          </div>
        </section>
      </div>

      <audio ref={remoteAudioRef} className={styles.hiddenAudio} autoPlay playsInline />
      <audio ref={localAudioRef} className={styles.hiddenAudio} autoPlay playsInline muted />
    </div>
  );
};

export default AudioCallDialer;
