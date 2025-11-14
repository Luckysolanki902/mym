import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../chatComps/styles/filteroptions.module.css';
import { IoFilterSharp } from 'react-icons/io5';
import { ThemeProvider, createTheme } from '@mui/material';
import { useFilters } from '@/context/FiltersContext';
import { useAudioCallContext } from '@/context/AudioCallContext';
import { CALL_STATUS, PAIRING_STATE } from '@/utils/audioCall/constants';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000'
    }
  }
});

const queueActiveStates = new Set([
  PAIRING_STATE.FINDING,
  PAIRING_STATE.WAITING,
  PAIRING_STATE.MATCHED,
  PAIRING_STATE.RINGING
]);

const AudioFilterOptions = ({ userDetails }) => {
  const serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';

  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const containerRef = useRef(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    collegeStats: []
  });
  const [isFetchingStats, setIsFetchingStats] = useState(false);

  const { preferredGender, setPreferredGender, preferredCollege, setPreferredCollege } = useFilters();
  const {
    state: { socket, pairingState, callStatus, partner }
  } = useAudioCallContext();

  const [tempGender, setTempGender] = useState(preferredGender || 'any');
  const [tempCollege, setTempCollege] = useState(preferredCollege || 'any');
  const [isUpdatingFilters, setIsUpdatingFilters] = useState(false);

  const isActivePair = Boolean(partner) || callStatus === CALL_STATUS.ACTIVE;
  const isQueueing = queueActiveStates.has(pairingState) && !isActivePair;

  const hasPendingChanges = useMemo(
    () => tempGender !== preferredGender || tempCollege !== preferredCollege,
    [preferredCollege, preferredGender, tempCollege, tempGender]
  );

  const toggleFilters = () => {
    if (!userDetails) return;
    setOpenFilterMenu((prev) => !prev);
  };

  useEffect(() => {
    if (userDetails) {
      if (!preferredGender) {
        const fallbackGender = userDetails.gender === 'male' ? 'female' : userDetails.gender === 'female' ? 'male' : 'any';
        setPreferredGender(fallbackGender);
        setTempGender(fallbackGender);
      }
      if (!preferredCollege) {
        setPreferredCollege('any');
        setTempCollege('any');
      }
    }
  }, [preferredCollege, preferredGender, setPreferredCollege, setPreferredGender, userDetails]);

  useEffect(() => {
    setTempGender(preferredGender || 'any');
    setTempCollege(preferredCollege || 'any');
  }, [preferredCollege, preferredGender]);

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const applyFilterChange = (nextCollege, nextGender) => {
    if (!socket || !isQueueing) {
      setPreferredCollege(nextCollege);
      setPreferredGender(nextGender);
      return;
    }

    if (!userDetails?.mid) {
      setPreferredCollege(nextCollege);
      setPreferredGender(nextGender);
      return;
    }

    setIsUpdatingFilters(true);
    socket.emit('updateFilters', {
      userMID: userDetails.mid,
      preferredGender: nextGender,
      preferredCollege: nextCollege,
      pageType: 'audiocall'
    });
  };

  const handleGenderChange = (value) => {
    setTempGender(value);
    applyFilterChange(tempCollege, value);
  };

  useEffect(() => {
    if (!socket) return;

    const handleFiltersUpdated = (data = {}) => {
      setIsUpdatingFilters(false);
      setPreferredGender(data.newFilters?.preferredGender ?? tempGender);
      setPreferredCollege(data.newFilters?.preferredCollege ?? tempCollege);
    };

    const handleFiltersFailed = (data = {}) => {
      console.error('[AudioFilterOptions] Failed to update filters:', data.message);
      setIsUpdatingFilters(false);
      setTempGender(preferredGender || 'any');
      setTempCollege(preferredCollege || 'any');
    };

    socket.on('filtersUpdated', handleFiltersUpdated);
    socket.on('filtersUpdateFailed', handleFiltersFailed);

    return () => {
      socket.off('filtersUpdated', handleFiltersUpdated);
      socket.off('filtersUpdateFailed', handleFiltersFailed);
    };
  }, [preferredCollege, preferredGender, setPreferredCollege, setPreferredGender, socket, tempCollege, tempGender]);

  const fetchStats = async () => {
    if (isFetchingStats) return;

    try {
      setIsFetchingStats(true);
      const response = await fetch(
        `${serverUrl.endsWith('/') ? `${serverUrl}api/user-stats` : `${serverUrl}/api/user-stats`}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch audio call stats');
      }
      const json = await response.json();
      if (json?.audioCallStats) {
        setStats(json.audioCallStats);
      }
    } catch (error) {
      console.error('Error fetching audio call stats:', error);
    } finally {
      setIsFetchingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <div className={styles.mainfiltercont} ref={containerRef}>
        {!openFilterMenu && (
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <IoFilterSharp
              className={styles.filterIcon}
              onClick={toggleFilters}
              style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '0.3rem' }}
            />
          </div>
        )}
        {openFilterMenu && (
          <div className={styles.filterContentWrapper}>
            <div className={styles.filterMenu}>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel} style={{ float: 'right' }}>
                  Listening now: {stats.totalUsers}
                </div>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel} style={{ minWidth: '15rem' }}>
                  College Preference
                </div>
                <div className={styles.chipsContainer}>
                  <div
                    onClick={() => {
                      setTempCollege('any');
                      applyFilterChange('any', tempGender);
                    }}
                    className={tempCollege === 'any' ? styles.chipSelected : styles.chipDefault}
                  >
                    Any
                  </div>
                  <div
                    onClick={() => {
                      const sameCollege = userDetails?.college || 'any';
                      setTempCollege(sameCollege);
                      applyFilterChange(sameCollege, tempGender);
                    }}
                    className={tempCollege === userDetails?.college ? styles.chipSelected : styles.chipDefault}
                  >
                    Same College
                  </div>
                </div>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel}>Meet With</div>
                <div className={styles.chipsContainer}>
                  <div
                    onClick={() => handleGenderChange('male')}
                    className={tempGender === 'male' ? styles.chipMale : styles.chipDefault}
                  >
                    Boys
                  </div>
                  <div
                    onClick={() => handleGenderChange('female')}
                    className={tempGender === 'female' ? styles.chipFemale : styles.chipDefault}
                  >
                    Girls
                  </div>
                  <div
                    onClick={() => handleGenderChange('any')}
                    className={tempGender === 'any' ? styles.chipSelected : styles.chipDefault}
                  >
                    Anyone
                  </div>
                </div>
              </div>
              {hasPendingChanges && !isQueueing && (
                <div className={styles.filterSection}>
                  <div className={styles.filterLabel} style={{ color: '#d32f2f' }}>
                    Changes saved. Start searching to apply them.
                  </div>
                </div>
              )}
              {isUpdatingFilters && (
                <div className={styles.filterSection}>
                  <div className={styles.filterLabel} style={{ color: '#0277bd' }}>
                    Updating your preferences…
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default AudioFilterOptions;
