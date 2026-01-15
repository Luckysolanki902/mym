import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/filteroptions.module.css';
import DerivativeIcon from '../commonComps/DerivativeIcon';
import { Chip, createTheme, ThemeProvider } from '@mui/material';
import { useFilters } from '@/context/FiltersContext';
import { motion, AnimatePresence } from 'framer-motion';
import OnlineCounter from '../commonComps/OnlineCounter';
import { useOnlineStats } from '@/hooks/useOnlineStats';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
  },
});

const FilterOptions = ({ userDetails, socket, isFindingPair, hasPaired, filterOpenRef, onlineCount: propOnlineCount, pageType = 'textchat', onHideIcon }) => {
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const mainFilterContainerRef = useRef(null);
  // Framer motion is used for animation now
  
  // Use Redux-managed online stats
  const { count } = useOnlineStats(pageType, propOnlineCount);

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

  const renderOnlineCounter = () => {
    const label = pageType === 'audiocall' ? 'callers online' : 'online';

    return (
        <div className={styles.onlineBadge}>
          <OnlineCounter
            count={count || 0}
            userGender={userDetails?.gender}
            label={label}
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
        <AnimatePresence>
        {(openFilterMenu) && (
          <motion.div 
            className={styles.filterContentWrapper} 
            data-tour="filter-menu"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
          >
            <div className={styles.filterMenu}>
              {renderOnlineCounter()}
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

               {/* Hide Icon Option */}
               {onHideIcon && hasPaired && (
                <div 
                  className={styles.filterSection} 
                  style={{ 
                    marginTop: '0.5rem', 
                    borderTop: '1px solid rgba(0,0,0,0.05)', 
                    paddingTop: '0.8rem',
                    marginBottom: '0' 
                  }}
                >
                  <div 
                    onClick={() => {
                        setOpenFilterMenu(false);
                        onHideIcon();
                    }}
                    style={{ 
                        fontSize: '0.9rem', 
                        color: '#666', 
                        cursor: 'pointer', 
                        textAlign: 'center',
                        fontWeight: 500,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.2s',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        // button like look
                        background: 'linear-gradient(rgba(0,0,0,0.02), rgba(0,0,0,0.05))',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#333'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                  >
                    <span>Hide filter icon for this chat</span>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </ThemeProvider>
  );
};

export default FilterOptions;
