import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/filteroptions.module.css';
import { IoFilterSharp } from 'react-icons/io5';
import { Chip, createTheme, ThemeProvider } from '@mui/material';
import { useFilters } from '@/context/FiltersContext';
import { useSpring, animated } from 'react-spring';
const darkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Ensure contrast for the chip text
    },
  },
});

const FilterOptions = ({ userDetails }) => {
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const mainFilterContainerRef = useRef(null);
  const filterContentAnimation = useSpring({
    transform: openFilterMenu ? 'translateX(0%) scale(1)' : 'translateX(100%) scale(0.6)',
    opacity: openFilterMenu ? 1 : 0,

    config: { tension: 220, friction: 20 }
  });
  // filters contexts
  const { preferredGender, setPreferredGender, preferredCollege, setPreferredCollege } = useFilters();
console.log({preferredCollege, preferredGender})
  const handleFilterToggle = () => {
    if (!userDetails) {
      return;
    }
    setOpenFilterMenu(!openFilterMenu);
  };

  useEffect(() => {
    if (userDetails) {
      console.log(userDetails)
      setPreferredCollege('any');
      setPreferredGender(userDetails.gender === 'male' ? 'female' : 'male');
    }
    else{
      console.log('no user')
    }

  }, [userDetails]);

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
    setPreferredCollege(value);
  };

  const handleGenderChange = (value) => {
    setPreferredGender(value);
  };

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
        {(openFilterMenu || !openFilterMenu) && (
          <animated.div style={filterContentAnimation} className={styles.filterContentWrapper}>
            <div className={styles.filterMenu}>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel}>College Preference</div>
                <div className={styles.chipsContainer}>
                  <Chip
                    label="Any"
                    onClick={() => handleCollegeChange('any')}
                    className={preferredCollege === 'any' ? styles.chipSelected : styles.chipDefault}
                    clickable
                  />
                  <Chip
                    label="Same College"
                    onClick={() => handleCollegeChange(userDetails?.college)}
                    className={preferredCollege === userDetails?.college ? styles.chipSelected : styles.chipDefault}
                    clickable
                  />
                  {/* Add other college options if needed */}
                </div>
              </div>
              <div className={styles.filterSection}>
                <div className={styles.filterLabel}>Meet With</div>
                <div className={styles.chipsContainer}>

                  <Chip
                    label="Male"
                    onClick={() => handleGenderChange('male')}
                    className={preferredGender === 'male' ? styles.chipMale : styles.chipDefault}
                    clickable
                  />
                  <Chip
                    label="Female"
                    onClick={() => handleGenderChange('female')}
                    className={preferredGender === 'female' ? styles.chipFemale : styles.chipDefault}
                    clickable
                  />
                  <Chip
                    label="Any"
                    onClick={() => handleGenderChange('any')}
                    className={preferredGender === 'any' ? styles.chipSelected : styles.chipDefault}
                    clickable
                  />
                </div>
              </div>
            </div>
            <p className={styles.note}>
            Filters will be applied in the next chat. If no preferred match is found, you will be paired with a random user.
            </p>
            {/* <p className={styles.note}>
              If the preferred match not found in queue, you will be paired to any one.
            </p> */}
          </animated.div>
        )}

      </div>
    </ThemeProvider>
  );
};

export default FilterOptions;
