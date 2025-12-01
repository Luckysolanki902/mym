// hooks/useOnlineStats.js
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateTextChatStats,
  updateAudioCallStats,
  selectTextChatStats,
  selectAudioCallStats,
} from '@/store/slices/onlineStatsSlice';

/**
 * Custom hook for managing online stats with 10-second staleness rule
 * @param {string} pageType - 'textchat' or 'audiocall'
 * @param {number|null} socketCount - Real-time count from socket (optional)
 * @returns {object} - { count, equation, updateCount }
 */
export const useOnlineStats = (pageType = 'textchat', socketCount = null) => {
  const dispatch = useDispatch();
  
  const textChatStats = useSelector(selectTextChatStats);
  const audioCallStats = useSelector(selectAudioCallStats);
  
  const stats = pageType === 'audiocall' ? audioCallStats : textChatStats;
  const updateAction = pageType === 'audiocall' ? updateAudioCallStats : updateTextChatStats;
  
  // Update count (from socket or manual)
  const updateCount = useCallback((count) => {
    if (typeof count === 'number' && count >= 0) {
      dispatch(updateAction({ count }));
    }
  }, [dispatch, updateAction]);
  
  // Auto-update from socket count when it changes
  useEffect(() => {
    if (typeof socketCount === 'number' && socketCount >= 0) {
      dispatch(updateAction({ count: socketCount }));
    }
  }, [socketCount, dispatch, updateAction]);
  
  return {
    count: stats.count,
    equation: stats.equation,
    lastUpdated: stats.lastUpdated,
    updateCount,
  };
};

/**
 * Hook specifically for text chat stats
 * @param {number|null} socketCount - Real-time count from socket
 */
export const useTextChatOnlineStats = (socketCount = null) => {
  return useOnlineStats('textchat', socketCount);
};

/**
 * Hook specifically for audio call stats
 * @param {number|null} socketCount - Real-time count from socket
 */
export const useAudioCallOnlineStats = (socketCount = null) => {
  return useOnlineStats('audiocall', socketCount);
};

export default useOnlineStats;
