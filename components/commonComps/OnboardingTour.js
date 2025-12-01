import React, { useEffect, useRef } from 'react';
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
    const driveSteps = steps.map((step) => ({
      element: step.target,
      popover: {
        title: step.title,
        description: `
          <div class="driver-popover-content">
            ${step.icon ? `<div class="driver-popover-icon">${step.icon}</div>` : ''}
            <div class="driver-popover-text">${step.description}</div>
            ${step.tip ? `<div class="driver-popover-tip">💡 ${step.tip}</div>` : ''}
          </div>
        `,
        side: step.placement || 'bottom',
        align: 'center',
      },
      // Keep reference to original step for callbacks
      _originalStep: step
    }));

    // Initialize driver
    driverRef.current = driver({
      showProgress: true,
      animate: true,
      allowClose: false, // Force use of buttons
      doneBtnText: 'Got it!',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      steps: driveSteps,
      
      onHighlightStarted: (element, step, options) => {
        if (onStepChange && step._originalStep) {
          const index = steps.indexOf(step._originalStep);
          onStepChange(index, step._originalStep);
        }
      },

      onNextClick: (element, step, options) => {
        const currentStepIndex = driveSteps.indexOf(step);
        if (currentStepIndex === driveSteps.length - 1) {
          // Last step
          dispatch(completeTour(tourName));
          if (onComplete) onComplete();
          driverRef.current.destroy();
        } else {
          driverRef.current.moveNext();
        }
      },

      onPrevClick: () => {
        driverRef.current.movePrevious();
      },

      onCloseClick: () => {
        dispatch(skipTour(tourName));
        if (onSkip) onSkip();
        driverRef.current.destroy();
      }
    });

    // Start the tour
    // Small delay to ensure DOM is ready if triggered immediately after a route change
    const timer = setTimeout(() => {
      driverRef.current.drive();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, [activeTour, tourName, steps, dispatch, onComplete, onSkip, onStepChange]);

  return null;
};

export default OnboardingTour;
