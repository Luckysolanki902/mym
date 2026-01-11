// Push Notification Initializer Component
// Silently initializes push notifications when the app loads

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const PushNotificationInit = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const initPush = async () => {
      // Only initialize if we have a user session
      if (!session?.user?.id) return;

      try {
        // Check if we're on a native platform
        const { Capacitor } = await import('@capacitor/core');
        
        if (!Capacitor.isNativePlatform()) {
          console.log('[PushInit] Not on native platform, skipping');
          return;
        }

        // Dynamically import push notification service
        const { pushNotificationService } = await import('@/utils/pushNotificationService');
        
        // Initialize push notifications
        const result = await pushNotificationService.initialize(session.user.id);
        
        if (result.success) {
          console.log('[PushInit] Push notifications initialized');
        } else {
          console.log('[PushInit] Failed to initialize:', result.reason || result.error);
        }
      } catch (error) {
        // Silently fail - Capacitor not available (web browser)
        if (!error.message?.includes('Cannot find module')) {
          console.log('[PushInit] Error:', error.message);
        }
      }
    };

    initPush();
  }, [session?.user?.id]);

  // This component renders nothing
  return null;
};

export default PushNotificationInit;
