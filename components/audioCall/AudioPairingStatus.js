import React, { useMemo } from 'react';
import styles from './styles/AudioPairingStatus.module.css';
import { useAudioCallContext } from '@/context/AudioCallContext';
import { useFilters } from '@/context/FiltersContext';
import { PAIRING_STATE } from '@/utils/audioCall/constants';

const waitingStates = new Set([
  PAIRING_STATE.FINDING,
  PAIRING_STATE.WAITING,
  PAIRING_STATE.MATCHED,
  PAIRING_STATE.RINGING
]);

const genderTheme = {
  male: {
    accent: '#0094d4'
  },
  female: {
    accent: '#e3368d'
  },
  other: {
    accent: '#6c5ce7'
  }
};

const buildMessage = ({ preferredGender, preferredCollege }) => {
  const genderText = preferredGender === 'any' ? 'anyone' : preferredGender === 'male' ? 'boys' : 'girls';
  const collegeText = preferredCollege === 'any' ? 'any college' : 'your college';
  return `Matching you with ${genderText} from ${collegeText}`;
};

const AudioPairingStatus = ({ userGender }) => {
  const {
    state: { pairingState, queueMetrics, partner }
  } = useAudioCallContext();
  const { preferredGender, preferredCollege } = useFilters();

  const isWaiting = waitingStates.has(pairingState);
  const hasPartner = Boolean(partner);
  const theme = genderTheme[userGender] || genderTheme.other;

  const message = useMemo(
    () => buildMessage({ preferredGender, preferredCollege }),
    [preferredCollege, preferredGender]
  );

  if (!isWaiting || hasPartner) {
    return null;
  }

  return (
    <div className={styles.statusContainer}>
      <span className={styles.pulseDot} style={{ backgroundColor: theme.accent }} />
      <div className={styles.copyBlock}>
        <p className={styles.headline}>{message}</p>
        <p className={styles.subline}>
          {queueMetrics.queueSize
            ? `${queueMetrics.queueSize} listeners are online right now`
            : 'Hang tight — we are nudging new listeners.'}
        </p>
      </div>
    </div>
  );
};

export default AudioPairingStatus;
