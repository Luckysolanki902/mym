// components/commonComps/ScrollToTop.js
'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// StyledButtonContainer for the animated container
const StyledButtonContainer = styled(animated.div)(({ theme }) => ({
  position: 'fixed',
  right: '2rem',
  bottom: '2rem',
  zIndex: 99999,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// StyledButton for the button appearance
const StyledButton = styled('div')(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

/**
 * ScrollToTop Component
 *
 * Props:
 * - scrollContainerRef (object): Ref of the scrollable container to track.
 */
const ScrollToTop = ({ scrollContainerRef }) => {
  const [isVisible, setIsVisible] = useState(false); // Controls button visibility

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const currentOffset = container.scrollTop;
      console.log('Current Scroll Y:', currentOffset);
      if (currentOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Attach the scroll event listener to the container
    container.addEventListener('scroll', handleScroll);

    // Initial check in case the user reloads at a scrolled position
    handleScroll();

    // Cleanup function to remove the event listener
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef]);

  // Animation settings using react-spring
  const animationProps = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    config: { tension: 200, friction: 20 },
  });

  const scrollToTop = () => {
    scrollContainerRef?.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isVisible && (
        <StyledButtonContainer style={animationProps} onClick={scrollToTop} aria-label="Scroll to Top">
          <StyledButton>
            <KeyboardArrowUpIcon style={{ color: 'black', fontSize: '1.5rem' }} />
          </StyledButton>
        </StyledButtonContainer>
      )}
    </>
  );
};

// Define PropTypes for type checking
ScrollToTop.propTypes = {
  scrollContainerRef: PropTypes.object.isRequired,
};

export default ScrollToTop;
