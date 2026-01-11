// Hook for managing push notifications in the Spyll app
// Initializes notifications when user is authenticated

import { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

let pushNotificationService = null;

// Dynamic import for Capacitor (only on native platforms)
const loadPushService = async () => {
  if (typeof window !== 'undefined') {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const module = await import('../utils/pushNotificationService');
        return module.pushNotificationService;
      }
    } catch (error) {
      console.log('[usePushNotifications] Not on native platform:', error.message);
    }
  }
  return null;
};

export const usePushNotifications = () => {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Initialize push notifications
  const initializePush = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('[usePushNotifications] No user session, skipping init');
      return;
    }

    try {
      pushNotificationService = await loadPushService();
      
      if (!pushNotificationService) {
        console.log('[usePushNotifications] Push service not available (not native)');
        return;
      }

      const result = await pushNotificationService.initialize(session.user.id);
      
      if (result.success) {
        setIsInitialized(true);
        if (result.token) {
          setToken(result.token);
        }
        console.log('[usePushNotifications] Initialized successfully');
      } else {
        console.log('[usePushNotifications] Init failed:', result.reason || result.error);
        setError(result.reason || result.error);
      }
    } catch (err) {
      console.error('[usePushNotifications] Error:', err);
      setError(err.message);
    }
  }, [session?.user?.id]);

  // Initialize on session change
  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      initializePush();
    }
  }, [session?.user?.id, isInitialized, initializePush]);

  // Add notification listener
  const addListener = useCallback((callback) => {
    if (pushNotificationService) {
      return pushNotificationService.addListener(callback);
    }
    return () => {};
  }, []);

  // Unregister device (for logout)
  const unregister = useCallback(async () => {
    if (pushNotificationService && session?.user?.id) {
      await pushNotificationService.unregisterDevice(session.user.id);
      setIsInitialized(false);
      setToken(null);
    }
  }, [session?.user?.id]);

  // Check if native platform
  const isNative = useCallback(() => {
    return pushNotificationService?.isNative() ?? false;
  }, []);

  return {
    isInitialized,
    token,
    error,
    addListener,
    unregister,
    isNative,
    reinitialize: initializePush,
  };
};

export default usePushNotifications;
