import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/filteroptions.module.css';
import { IoFilterSharp } from 'react-icons/io5';
import { createTheme, ThemeProvider } from '@mui/material';
import { useSpring, animated } from 'react-spring';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Ensure contrast for the chip text
    },
  },
});

const FilterOptions = ({ userDetails, onChange }) => {
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const mainFilterContainerRef = useRef(null);
  const filterContentAnimation = useSpring({
    transform: openFilterMenu ? 'translateX(0%) scale(1)' : 'translateX(100%) scale(0.6)',
    opacity: openFilterMenu ? 1 : 0,
    config: { tension: 220, friction: 20 },
  });

  const [filters, setFilters] = useState({
    college: 'all',
    gender: '',
  });

  const handleFilterToggle = () => {
    if (!userDetails) {
      return;
    }
    setOpenFilterMenu(!openFilterMenu);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  useEffect(() => {
    onChange(filters);
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mainFilterContainerRef.current && !mainFilterContainerRef.current.contains(event.target)) {
        setOpenFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mainFilterContainerRef]);

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.mainfiltercont} ref={mainFilterContainerRef}>
        {!openFilterMenu && (
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <IoFilterSharp
              className={styles.filterIcon}
              onClick={handleFilterToggle}
              style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '0.3rem' }}
            />
          </div>
        )}
        {openFilterMenu && (
          <animated.div style={filterContentAnimation} className={styles.filterContentWrapper}>
            <div className={styles.filterMenu}>
              <div className={styles.filterSection}>
                <div className={styles.heading}>Filters</div>
                <div className={styles.filterLabel}>From</div>
                <div className={styles.chipsContainer}>
                  <div
                    className={filters.college === 'all' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('college', 'all')}
                  >
                    All Colleges
                  </div>
                  <div
                    className={filters.college === 'yourCollege' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('college', 'yourCollege')}
                  >
                    Your College
                  </div>
                  <div
                    className={filters.college === 'otherColleges' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('college', 'otherColleges')}
                  >
                    Other Colleges
                  </div>
                </div>
                <div className={styles.filterLabel}>Gender</div>
                <div className={styles.chipsContainer}>
                  <div
                    className={filters.gender === 'male' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('gender', 'male')}
                  >
                    Male
                  </div>
                  <div
                    className={filters.gender === 'female' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('gender', 'female')}
                  >
                    Female
                  </div>
                  <div
                    className={filters.gender === '' ? styles.chipSelected : styles.chipDefault}
                    onClick={() => handleFilterChange('gender', '')}
                  >
                    Any
                  </div>
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
