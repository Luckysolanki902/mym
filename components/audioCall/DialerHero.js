import React, { useMemo } from 'react';
import styles from './styles/DialerHero.module.css';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';

const CALL_STATE_COPY = {
  [CALL_STATE.IDLE]: 'Enable microphone to start',
  [CALL_STATE.PREPARING_MIC]: 'Preparing mic…',
  [CALL_STATE.WAITING]: 'Waiting for partner…',
  [CALL_STATE.DIALING]: 'Dialing…',
  [CALL_STATE.CONNECTED]: 'Connected',
  [CALL_STATE.RECONNECTING]: 'Reconnecting…',
  [CALL_STATE.ENDED]: 'Call ended',
};

const DialerHero = ({ userDetails, controller }) => {
  const {
    partner,
    callState,
    callDuration,
    micStatus,
    waveformData,
    qualityScore,
    telemetry,
    queuePosition,
    queueSize,
  } = useAudioCall();

  const formattedTimer = useMemo(() => {
    const seconds = Math.max(0, Math.floor(callDuration / 1000));
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [callDuration]);

  const heroInitial = partner?.initials || partner?.nickname?.[0] || userDetails?.gender?.[0] || 'U';
  const micCopy = micStatus === MIC_STATE.GRANTED ? 'Mic ready' : micStatus === MIC_STATE.DENIED ? 'Mic blocked' : 'Awaiting mic permission';
  const shouldShowMicCTA = micStatus !== MIC_STATE.GRANTED;
  const micButtonLabel = micStatus === MIC_STATE.DENIED ? 'Enable mic in settings' : 'Enable microphone';
  const handleMicCta = () => {
    if (typeof controller?.requestMicAccess === 'function') {
      controller.requestMicAccess();
    }
  };
  const disableMicCTA = typeof controller?.requestMicAccess !== 'function';
  const partnerLabel = partner?.nickname || partner?.mid || 'Future friend';
  const showWaveform = callState === CALL_STATE.CONNECTED && waveformData?.length;
  const qualityBadge = qualityScore?.composite ? `${qualityScore.composite}% call quality` : null;

  const queueBadge = queuePosition ? `Queue #${queuePosition}` : 'Queue ready';
  const waitCopy = telemetry?.estimatedWait
    ? `ETA ${telemetry.estimatedWait}s`
    : telemetry?.waitTime
    ? `Waiting ${telemetry.waitTime}s`
    : 'Preparing the best match';

  const metaStats = [
    { label: 'Mic', value: micCopy },
    { label: 'Queue', value: queueBadge },
    { label: 'Online', value: queueSize ? `${queueSize} people` : 'Checking' },
    { label: 'Status', value: CALL_STATE_COPY[callState] },
  ];

  return (
    <div className={styles.heroShell}>
      <article className={styles.callCard}>
        <header className={styles.cardHeader}>
          <span className={styles.callStateBadge}>{CALL_STATE_COPY[callState]}</span>
          <span className={styles.timerDisplay}>{formattedTimer}</span>
        </header>
        <div className={styles.partnerRow}>
          <div className={styles.partnerAvatar}>{heroInitial}</div>
          <div className={styles.partnerMeta}>
            <p className={styles.partnerName}>{partnerLabel}</p>
            <p className={styles.partnerSub}>{micCopy}</p>
          </div>
          {qualityBadge ? <span className={styles.qualityChip}>{qualityBadge}</span> : null}
        </div>
        <p className={styles.connectionCopy}>{waitCopy}</p>
        <div className={styles.waveform} aria-hidden>
          {(showWaveform ? waveformData.slice(0, 36) : Array.from({ length: 24 }, (_, idx) => 0.25 + (idx % 4) * 0.05)).map(
            (value, index) => (
              <span key={`wave-${index}`} style={{ height: `${Math.min(100, Math.abs(value) * 100)}%` }} />
            )
          )}
        </div>
      </article>
      <article className={styles.metaCard}>
        <div className={styles.metaGrid}>
          {metaStats.map((stat) => (
            <div key={stat.label} className={styles.metaItem}>
              <p className={styles.metaLabel}>{stat.label}</p>
              <p className={styles.metaValue}>{stat.value}</p>
            </div>
          ))}
        </div>
        {shouldShowMicCTA ? (
          <button type="button" className={styles.micButton} onClick={handleMicCta} disabled={disableMicCTA}>
            {micButtonLabel}
          </button>
        ) : (
          <p className={styles.helperCopy}>Sit tight. We will notify you the moment someone connects.</p>
        )}
      </article>
    </div>
  );
};

export default DialerHero;
