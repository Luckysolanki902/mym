import React, { useEffect, useState, useRef } from 'react';
import styles from '../componentStyles/filteroptions.module.css';
import { IoFilterSharp } from 'react-icons/io5';
import { MenuItem, Button, FormControl, createTheme, ThemeProvider, Menu } from '@mui/material';
import { FaChevronDown } from "react-icons/fa";
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF', // Set the color you want for the selected item
    },
  },
});

const FilterOptions = ({ filters, setFilters, userCollege, userGender, userDetails }) => {
  const [openFilterIcon, setOpenFilterIcon] = useState(false);
  const [collegeMenuAnchor, setCollegeMenuAnchor] = useState(null);
  const [genderMenuAnchor, setGenderMenuAnchor] = useState(null);
  const [collegeMenuWidth, setCollegeMenuWidth] = useState(null);
  const [genderMenuWidth, setGenderMenuWidth] = useState(null);
  const mainFilterContainerRef = useRef(null);


  const handlefilterToggle = () => {
    if (!userCollege || !userGender || userDetails) {
      return;
    }
    setOpenFilterIcon(!openFilterIcon);
  };

  useEffect(() => {
    if (userDetails) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        college: userDetails?.college || 'any',
        preferredGender: userDetails?.gender === 'male' ? 'female' : 'male',
      }));
    }
  }, [userDetails]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the clicked element is not within the main container
      if (
        mainFilterContainerRef.current &&
        !mainFilterContainerRef.current.contains(event.target) &&
        // Check if the clicked element is not an option within the MUI Menu
        !event.target.closest('[role="menuitem"]')
      ) {
        setOpenFilterIcon(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mainFilterContainerRef]);
  useEffect(() => {
    if (userCollege && userGender) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        college: userCollege || 'any',
        strangerGender: userGender === 'male' ? 'female' : 'male', // Set the default as the opposite gender
      }));
    }
  }, [userCollege, userGender, setFilters]);

  const handleCollegeChange = (value) => {
    setCollegeMenuAnchor(null);
    setFilters((prevFilters) => ({
      ...prevFilters,
      college: value,
    }));
  };

  const handleGenderChange = (value) => {
    setGenderMenuAnchor(null);
    setFilters((prevFilters) => ({
      ...prevFilters,
      strangerGender: value,
    }));
  };

  const handleCollegeMenuOpen = (event) => {
    console.log('pressed')
    setCollegeMenuAnchor(event.currentTarget);
    setCollegeMenuWidth(event.currentTarget.offsetWidth);
  };

  const handleGenderMenuOpen = (event) => {
    setGenderMenuAnchor(event.currentTarget);
    setGenderMenuWidth(event.currentTarget.offsetWidth);
  };

  const isCollegeSelected = (value) => filters.college === value;
  const isGenderSelected = (value) => filters.strangerGender === value;


  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.mainfiltercont} ref={mainFilterContainerRef}  >
        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
          {openFilterIcon &&
            <div className={styles.cancelDiv} style={{ width: '100%', opacity: '0' }} onClick={() => setOpenFilterIcon(false)}></div>
          }
          <IoFilterSharp className={styles.filterIcon} onClick={handlefilterToggle} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '0.3rem' }} />
        </div>

        <div className={`${styles.closedFilters} ${openFilterIcon && styles.openFilters}`}>
          <FormControl className={styles.FormControl}>
            <Button onClick={handleCollegeMenuOpen}>
              <div className={styles.toggleMenu}>
                <div>College Preference</div>
                <div><FaChevronDown /></div>
              </div>
            </Button>
            <Menu
              anchorEl={collegeMenuAnchor}
              open={Boolean(collegeMenuAnchor)}
              onClose={() => setCollegeMenuAnchor(null)}
              slotProps={{ paper: { style: { width: collegeMenuWidth } } }}
            >
              <MenuItem onClick={() => handleCollegeChange('any')} selected={isCollegeSelected('any')}>Any</MenuItem>
              <MenuItem onClick={() => handleCollegeChange(userCollege)} selected={isCollegeSelected(userCollege)}>Same College</MenuItem>
              {/* Add other college options if needed */}
            </Menu>
          </FormControl>

          <FormControl className={styles.FormControl}>
            <Button onClick={handleGenderMenuOpen}>
              <div className={styles.toggleMenu}>
                <div>Meet With</div>
                <div><FaChevronDown /></div>
              </div>
            </Button>
            <Menu
              anchorEl={genderMenuAnchor}
              open={Boolean(genderMenuAnchor)}
              onClose={() => setGenderMenuAnchor(null)}
              slotProps={{ paper: { style: { width: genderMenuWidth } } }}
            >
              <MenuItem selected={isGenderSelected('male')} onClick={() => handleGenderChange('male')}>Male</MenuItem>
              <MenuItem selected={isGenderSelected('female')} onClick={() => handleGenderChange('female')}>Female</MenuItem>
              <MenuItem selected={isGenderSelected('any')} onClick={() => handleGenderChange('any')}>Any</MenuItem>
            </Menu>
          </FormControl>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default FilterOptions;
