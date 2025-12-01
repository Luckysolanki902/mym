import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/filteroptions.module.css';
import DerivativeIcon from '../commonComps/DerivativeIcon';
import { Chip, createTheme, ThemeProvider } from '@mui/material';
import { useFilters } from '@/context/FiltersContext';
import { useSpring, animated } from 'react-spring';
import { motion, AnimatePresence } from 'framer-motion';
import AlgebraEquation from '../commonComps/AlgebraEquation';
import { generateEquationWithContext } from '@/utils/algebraUtils';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
  },
});

const FilterOptions = ({ userDetails, socket, isFindingPair, hasPaired, filterOpenRef, onlineCount: propOnlineCount, pageType = 'textchat' }) => {
  const serverUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';

  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const mainFilterContainerRef = useRef(null);
  const filterContentAnimation = useSpring({
    transform: openFilterMenu ? 'translateX(0%) scale(1)' : 'translateX(100%) scale(0.6)',
    opacity: openFilterMenu ? 1 : 0,
    config: { tension: 220, friction: 20 }
  });
  
  // Use prop online count if provided, otherwise fetch
  const [fetchedOnlineCount, setFetchedOnlineCount] = useState(0);
  const [lastFetchedTime, setLastFetchedTime] = useState(0);
  const onlineCount = propOnlineCount !== undefined ? propOnlineCount : fetchedOnlineCount;

  // Filter contexts
  const { preferredGender, setPreferredGender, preferredCollege, setPreferredCollege } = useFilters();
  
  // Track temporary filter changes
  const [tempGender, setTempGender] = useState(preferredGender);
  const [tempCollege, setTempCollege] = useState(preferredCollege);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if filters have changed
  const hasChanges = tempGender !== preferredGender || tempCollege !== preferredCollege;

  // Expose filter state to parent via ref for tour control
  useEffect(() => {
    if (filterOpenRef) {
      filterOpenRef.current = {
        open: () => setOpenFilterMenu(true),
        close: () => setOpenFilterMenu(false),
        toggle: () => setOpenFilterMenu(prev => !prev),
        isOpen: openFilterMenu
      };
    }
  }, [filterOpenRef, openFilterMenu]);

  const handleFilterToggle = () => {
    if (!userDetails) {
      return;
    }
    setOpenFilterMenu(!openFilterMenu);
  };

  useEffect(() => {
    if (userDetails && !preferredGender) {
      const defaultGender = userDetails.gender === 'male' ? 'female' : 'male';
      setPreferredGender(defaultGender);
      setTempGender(defaultGender);
    }
    if (userDetails && !preferredCollege) {
      setPreferredCollege('any');
      setTempCollege('any');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]);

  // Sync temp values when actual values change
  useEffect(() => {
    setTempGender(preferredGender);
    setTempCollege(preferredCollege);
  }, [preferredGender, preferredCollege]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mainFilterContainerRef.current &&
        !mainFilterContainerRef.current.contains(event.target)
      ) {
        setOpenFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mainFilterContainerRef]);

  const handleCollegeChange = (value) => {
    setTempCollege(value);
    // Apply instantly with the NEW value, not tempGender which might be stale
    applyFilterChange(value, tempGender);
  };

  const handleGenderChange = (value) => {
    setTempGender(value);
    // Apply instantly with the NEW value, not tempCollege which might be stale
    applyFilterChange(tempCollege, value);
  };

  // Apply filter changes instantly
  const applyFilterChange = (college, gender) => {
    if (!socket || !isFindingPair || hasPaired) {
      // If not in queue, just update context
      setPreferredGender(gender);
      setPreferredCollege(college);
      return;
    }

    // User is in queue - send update request to server
    setIsUpdating(true);
    
    socket.emit('updateFilters', {
      userMID: userDetails?.mid, // Use actual user MID, not socket.id
      preferredGender: gender,
      preferredCollege: college,
      pageType: 'textchat'
    });
  };

  // Listen for filter update responses
  useEffect(() => {
    if (!socket) return;

    // Listen for successful filter update
    const handleFiltersUpdated = (data) => {
      setIsUpdating(false);
      setPreferredGender(data.newFilters.preferredGender);
      setPreferredCollege(data.newFilters.preferredCollege);
    };

    // Listen for failed filter update
    const handleFiltersUpdateFailed = (data) => {
      console.error('[FilterOptions] Failed to update filters:', data.message);
      setIsUpdating(false);
      // Revert to original filters
      setTempGender(preferredGender);
      setTempCollege(preferredCollege);
    };

    socket.on('filtersUpdated', handleFiltersUpdated);
    socket.on('filtersUpdateFailed', handleFiltersUpdateFailed);

    return () => {
      socket.off('filtersUpdated', handleFiltersUpdated);
      socket.off('filtersUpdateFailed', handleFiltersUpdateFailed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, preferredGender, preferredCollege]);

  // Only fetch stats if not provided via prop - with 10 sec persistence for audio call
  useEffect(() => {
    // Skip fetching if online count is provided as prop
    if (propOnlineCount !== undefined) return;

    const fetchStats = async () => {
      try {
        const now = Date.now();
        // For audio call, persist data for 10 seconds
        if (pageType === 'audiocall' && lastFetchedTime && (now - lastFetchedTime < 10000)) {
          return;
        }
        
        const response = await fetch(`${serverUrl.endsWith('/') ? serverUrl + 'api/user-stats' : serverUrl + '/api/user-stats'}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        
        // Use appropriate stats based on page type
        const stats = pageType === 'audiocall' ? data.audioCallStats : data.textChatStats;
        setFetchedOnlineCount(stats?.totalUsers || 0);
        setLastFetchedTime(now);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, pageType === 'audiocall' ? 10000 : 3000);
    return () => clearInterval(intervalId);
  }, [userDetails, propOnlineCount, pageType, serverUrl, lastFetchedTime]);

  const renderEquationSummary = () => {
    const eqSource = Math.max(onlineCount || 0, 1);
    const hintText = pageType === 'audiocall' ? 'callers online' : 'students online';
    const eq = generateEquationWithContext(eqSource, hintText);
    const userTheme = userDetails?.gender === 'female' ? 'pink' : userDetails?.gender === 'male' ? 'cyan' : 'purple';
    const accentTheme = userDetails?.gender === 'female' ? 'cyan' : userDetails?.gender === 'male' ? 'pink' : 'purple';

    return (
        <div className={styles.equationBadge}>
          <AlgebraEquation
            coefficient={eq.coefficient}
            constant={eq.constant}
            result={eq.result}
            hint={eq.hint}
            theme={userTheme}
            hintTheme={accentTheme}
            size="small"
          />
        </div>

    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.mainfiltercont} ref={mainFilterContainerRef}>
        {!openFilterMenu && (
          <div 
            className={styles.filterTrigger} 
            onClick={handleFilterToggle} 
            title="Adjust match formula"
            data-tour="filter-button"
          >
            <DerivativeIcon size={22} color="#1a1a1a" isOpen={openFilterMenu} />
          </div>
        )}
        {(openFilterMenu) && (
          <animated.div style={filterContentAnimation} className={styles.filterContentWrapper} data-tour="filter-menu">
            <div className={styles.filterMenu}>
              {renderEquationSummary()}
              <div className={styles.filterSection}>
                <div className={styles.filterLabel}>College</div>
                <div className={styles.chipsContainer}>
                  <div
                    onClick={() => handleCollegeChange('any')}
                    className={tempCollege === 'any' ? styles.chipSelected : styles.chipDefault}
                  >
                    Any
                  </div>
                  <div
                    onClick={() => handleCollegeChange(userDetails?.college)}
                    className={tempCollege === userDetails?.college ? styles.chipSelected : styles.chipDefault}
                  >Yours</div>
                </div>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel}>Meet With</div>
                <div className={styles.chipsContainer}>
                  <div
                    onClick={() => handleGenderChange('male')}
                    className={tempGender === 'male' ? styles.chipMale : styles.chipDefault}
                  >Boys</div>
                  <div
                    onClick={() => handleGenderChange('female')}
                    className={tempGender === 'female' ? styles.chipFemale : styles.chipDefault}
                  >Girls</div>
                  <div
                    onClick={() => handleGenderChange('any')}
                    className={tempGender === 'any' ? styles.chipSelected : styles.chipDefault}
                  >Anyone</div>
                </div>
              </div>
            </div>

          </animated.div>
        )}

      </div>
    </ThemeProvider>
  );
};

export default FilterOptions;
