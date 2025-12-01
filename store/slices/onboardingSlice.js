// store/slices/onboardingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  completedTours: {
    textChat: false,
    audioCall: false,
    allConfessions: false,
    confessionDetail: false,
  },
  // Track if user has seen specific features
  seenFeatures: {
    filterMenu: false,
    findNewButton: false,
    queueSystem: false,
    genderColors: false,
    anonymousDm: false,
    shareConfession: false,
  },
  // Current active tour state
  activeTour: null, // 'textChat' | 'audioCall' | 'confessions' | 'confessionDetail' | null
  currentStep: 0,
  tourPaused: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    startTour: (state, action) => {
      state.activeTour = action.payload;
      state.currentStep = 0;
      state.tourPaused = false;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action) => {
      state.currentStep = action.payload;
    },
    pauseTour: (state) => {
      state.tourPaused = true;
    },
    resumeTour: (state) => {
      state.tourPaused = false;
    },
    completeTour: (state, action) => {
      const tourName = action.payload;
      if (state.completedTours.hasOwnProperty(tourName)) {
        state.completedTours[tourName] = true;
      }
      state.activeTour = null;
      state.currentStep = 0;
      state.tourPaused = false;
    },
    skipTour: (state, action) => {
      const tourName = action.payload;
      if (state.completedTours.hasOwnProperty(tourName)) {
        state.completedTours[tourName] = true;
      }
      state.activeTour = null;
      state.currentStep = 0;
      state.tourPaused = false;
    },
    markFeatureSeen: (state, action) => {
      const feature = action.payload;
      if (state.seenFeatures.hasOwnProperty(feature)) {
        state.seenFeatures[feature] = true;
      }
    },
    resetTour: (state, action) => {
      const tourName = action.payload;
      if (tourName) {
        if (state.completedTours.hasOwnProperty(tourName)) {
          state.completedTours[tourName] = false;
        }
      } else {
        // Reset all tours
        Object.keys(state.completedTours).forEach(key => {
          state.completedTours[key] = false;
        });
        Object.keys(state.seenFeatures).forEach(key => {
          state.seenFeatures[key] = false;
        });
      }
      state.activeTour = null;
      state.currentStep = 0;
    },
    resetAllOnboarding: (state) => {
      return initialState;
    },
  },
});

export const {
  startTour,
  nextStep,
  prevStep,
  goToStep,
  pauseTour,
  resumeTour,
  completeTour,
  skipTour,
  markFeatureSeen,
  resetTour,
  resetAllOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

// Selectors
export const selectActiveTour = (state) => state.onboarding.activeTour;
export const selectCurrentStep = (state) => state.onboarding.currentStep;
export const selectIsTourPaused = (state) => state.onboarding.tourPaused;
export const selectCompletedTours = (state) => state.onboarding.completedTours;
export const selectSeenFeatures = (state) => state.onboarding.seenFeatures;
export const selectIsTourCompleted = (tourName) => (state) => 
  state.onboarding.completedTours[tourName] || false;
