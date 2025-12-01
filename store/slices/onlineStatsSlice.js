// store/slices/onlineStatsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const STALE_THRESHOLD_MS = 10000; // 10 seconds

const initialState = {
  textChat: {
    count: 0,
    equation: null, // { coefficient, constant, result, hint }
    lastUpdated: 0,
  },
  audioCall: {
    count: 0,
    equation: null,
    lastUpdated: 0,
  },
};

// Prime numbers for equation generation
const PRIME_COEFFICIENTS = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

// Generate equation deterministically or randomly
const generateEquation = (count, hint) => {
  const x = Math.max(1, Math.floor(count));
  const a = PRIME_COEFFICIENTS[Math.floor(Math.random() * PRIME_COEFFICIENTS.length)];
  const b = Math.floor(Math.random() * 50) + 1;
  const c = a * x + b;
  
  return {
    coefficient: a,
    constant: b,
    result: c,
    solution: x,
    hint: hint,
  };
};

const onlineStatsSlice = createSlice({
  name: 'onlineStats',
  initialState,
  reducers: {
    // Update stats - only regenerates equation if count changed or data is stale
    updateTextChatStats: (state, action) => {
      const { count, forceRefresh = false } = action.payload;
      const now = Date.now();
      const isStale = now - state.textChat.lastUpdated > STALE_THRESHOLD_MS;
      const countChanged = count !== state.textChat.count;
      
      // Only regenerate equation if count changed, data is stale, or forced
      if (countChanged || isStale || forceRefresh || !state.textChat.equation) {
        state.textChat.count = count;
        state.textChat.equation = generateEquation(count, 'n people online');
        state.textChat.lastUpdated = now;
      }
    },
    
    updateAudioCallStats: (state, action) => {
      const { count, forceRefresh = false } = action.payload;
      const now = Date.now();
      const isStale = now - state.audioCall.lastUpdated > STALE_THRESHOLD_MS;
      const countChanged = count !== state.audioCall.count;
      
      if (countChanged || isStale || forceRefresh || !state.audioCall.equation) {
        state.audioCall.count = count;
        state.audioCall.equation = generateEquation(count, 'n callers online');
        state.audioCall.lastUpdated = now;
      }
    },
    
    // Clear stats (on logout, etc.)
    clearStats: (state) => {
      state.textChat = initialState.textChat;
      state.audioCall = initialState.audioCall;
    },
  },
});

export const { updateTextChatStats, updateAudioCallStats, clearStats } = onlineStatsSlice.actions;

// Selectors
export const selectTextChatStats = (state) => state.onlineStats?.textChat || initialState.textChat;
export const selectAudioCallStats = (state) => state.onlineStats?.audioCall || initialState.audioCall;
export const selectTextChatEquation = (state) => state.onlineStats?.textChat?.equation;
export const selectAudioCallEquation = (state) => state.onlineStats?.audioCall?.equation;

export default onlineStatsSlice.reducer;
