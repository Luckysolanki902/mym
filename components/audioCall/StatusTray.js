import React, { useMemo } from 'react';
import styles from './styles/StatusTray.module.css';
import { useAudioCall, CALL_STATE, MIC_STATE } from '@/context/AudioCallContext';

const StatusTray = ({ userDetails, pairingState }) => {
  const {
    queuePosition,
    queueSize,
    filterDescription,
    callState,
    micStatus,
    telemetry,
    qualityScore,
    partner,
    error,
  } = useAudioCall();

  const primaryCopy = useMemo(() => {
    if (callState === CALL_STATE.CONNECTED) {
      return `Connected with ${partner?.nickname || 'a new friend'}.`;
    }
    if (callState === CALL_STATE.DIALING) {
      return 'Dialing your partner…';
    }
    if (pairingState === 'WAITING') {
      return `Finding the best match for you, ${userDetails?.firstName || 'friend'}`;
    }
    return 'Enable your microphone to join the queue.';
  }, [callState, pairingState, partner?.nickname, userDetails]);

  const micCopy = micStatus === MIC_STATE.GRANTED ? 'Mic ready' : micStatus === MIC_STATE.DENIED ? 'Mic blocked' : 'Mic permission needed';
  const waitTimeCopy = telemetry?.waitTime ? `${telemetry.waitTime}s in queue` : null;
  const etaCopy = telemetry?.estimatedWait ? `ETA ${telemetry.estimatedWait}s` : null;
  const qualityChip = qualityScore?.composite ? `${qualityScore.composite}% quality` : null;
  const queueCopy = queueSize ? `${queueSize} waiting` : null;

  const metrics = [
    { label: `Queue #${queuePosition || 0}` },
    queueCopy ? { label: queueCopy } : null,
    waitTimeCopy ? { label: waitTimeCopy } : null,
    etaCopy ? { label: etaCopy } : null,
    filterDescription ? { label: filterDescription } : null,
    qualityChip ? { label: qualityChip, tone: 'success' } : null,
    micCopy ? { label: micCopy } : null,
  ].filter(Boolean);

  return (
    <div className={styles.queueBar}>
      <div className={styles.queueCopy}>
        <p className={styles.queueLabel}>Audio queue</p>
        <p className={styles.queuePrimary}>{primaryCopy}</p>
        {error ? <p className={styles.errorText}>{error}</p> : null}
      </div>
      <div className={styles.queueMetrics}>
        {metrics.map((metric) => (
          <span key={metric.label} className={`${styles.metricChip} ${metric.tone === 'success' ? styles.metricSuccess : ''}`}>
            {metric.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StatusTray;
