import React, { useEffect, useRef, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  completeTour,
  skipTour,
  selectActiveTour,
} from '@/store/slices/onboardingSlice';

/**
 * OnboardingTour - Reusable tour/walkthrough component using driver.js
 * 
 * @param {string} tourName - Name of the tour (textChat, audioCall, confessions, confessionDetail)
 * @param {Array} steps - Array of step configurations
 * @param {Function} onComplete - Callback when tour is completed
 * @param {Function} onSkip - Callback when tour is skipped
 * @param {Function} onStepChange - Callback when step changes
 */
const OnboardingTour = ({
  tourName,
  steps = [],
  onComplete,
  onSkip,
  onStepChange,
}) => {
  const dispatch = useDispatch();
  const activeTour = useSelector(selectActiveTour);
  const driverRef = useRef(null);
  const currentStepIndexRef = useRef(0);

  // Stable callback refs
  const onCompleteRef = useRef(onComplete);
  const onSkipRef = useRef(onSkip);
  const onStepChangeRef = useRef(onStepChange);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSkipRef.current = onSkip;
    onStepChangeRef.current = onStepChange;
  }, [onComplete, onSkip, onStepChange]);

  const handleComplete = useCallback(() => {
    dispatch(completeTour(tourName));
    if (onCompleteRef.current) onCompleteRef.current();
  }, [dispatch, tourName]);

  const handleSkip = useCallback(() => {
    dispatch(skipTour(tourName));
    if (onSkipRef.current) onSkipRef.current();
  }, [dispatch, tourName]);

  useEffect(() => {
    // Only run if this tour is active
    if (activeTour !== tourName) {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    // Map our steps to driver.js steps
    const driveSteps = steps.map((step, index) => ({
      element: step.target || undefined, // undefined = no highlight (centered popover)
      popover: {
        title: step.title,
        description: `
          <div class="driver-popover-content">
            ${step.icon ? `<div class="driver-popover-icon">${step.icon}</div>` : ''}
            <div class="driver-popover-text">${step.description}</div>
            ${step.tip ? `<div class="driver-popover-tip">💡 ${step.tip}</div>` : ''}
          </div>
        `,
        side: step.placement === 'center' ? 'over' : (step.placement || 'bottom'),
        align: 'center',
      },
      onHighlightStarted: () => {
        currentStepIndexRef.current = index;
        // Trigger step change callback for actions like opening filter
        if (onStepChangeRef.current) {
          onStepChangeRef.current(index, step);
        }
      },
    }));

    // Initialize driver with proper configuration
    driverRef.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 12,
      stageRadius: 12,
      popoverClass: 'driverjs-theme',
      doneBtnText: 'Got it!',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      showButtons: ['next', 'previous', 'close'],
      steps: driveSteps,
      
      onDestroyStarted: () => {
        // Check if we completed or skipped
        const isLastStep = currentStepIndexRef.current === steps.length - 1;
        if (isLastStep) {
          handleComplete();
        } else {
          handleSkip();
        }
        if (driverRef.current) {
          driverRef.current.destroy();
        }
      },
    });

    // Start the tour with a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (driverRef.current) {
        driverRef.current.drive();
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [activeTour, tourName, steps, handleComplete, handleSkip]);

  return null;
};

export default OnboardingTour;
