// Push Notification Initializer Component
// Silently initializes push notifications when the app loads

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Generate or get device ID for anonymous users
const getDeviceId = () => {
  if (typeof window === 'undefined') return null;
  
  let deviceId = localStorage.getItem('spyll_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('spyll_device_id', deviceId);
  }
  return deviceId;
};

const PushNotificationInit = () => {
  const { data: session, status } = useSession();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initPush = async () => {
      // Wait for session to load
      if (status === 'loading') return;
      
      // Prevent double initialization
      if (hasInitialized.current) return;

      // Delay initialization to let the app fully load first
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // Check if we're on a native platform
        const { Capacitor } = await import('@capacitor/core');
        
        if (!Capacitor.isNativePlatform()) {
          console.log('[PushInit] Not on native platform, skipping');
          return;
        }

        // Use session user ID if logged in, otherwise use device ID
        const userId = session?.user?.id || getDeviceId();
        
        if (!userId) {
          console.log('[PushInit] No user ID or device ID available');
          return;
        }

        console.log('[PushInit] Initializing push notifications for:', userId);
        
        // Dynamically import push notification service
        const { pushNotificationService } = await import('@/utils/pushNotificationService');
        
        // Initialize push notifications
        const result = await pushNotificationService.initialize(userId);
        
        if (result.success) {
          console.log('[PushInit] ✅ Push notifications initialized successfully');
          hasInitialized.current = true;
        } else {
          console.log('[PushInit] ❌ Failed to initialize:', result.reason || result.error);
        }
      } catch (error) {
        // Log the error for debugging but don't crash
        console.log('[PushInit] Error:', error?.message || error);
      }
    };

    initPush();
  }, [session?.user?.id, status]);

  // This component renders nothing
  return null;
};

export default PushNotificationInit;
