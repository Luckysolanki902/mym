// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import signupReducer from './slices/signupSlice';
import unverifiedUserDetailsReducer from './slices/unverifiedUserDetailsSlice';
import onboardingReducer from './slices/onboardingSlice';
import onlineStatsReducer from './slices/onlineStatsSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const rootReducer = combineReducers({
  signup: signupReducer,
  unverifiedUserDetails: unverifiedUserDetailsReducer,
  onboarding: onboardingReducer,
  onlineStats: onlineStatsReducer,
  // Add other reducers here if needed
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['signup', 'unverifiedUserDetails', 'onboarding'], // Don't persist onlineStats - it should be fresh
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persist uses non-serializable values, so we need to ignore certain actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
