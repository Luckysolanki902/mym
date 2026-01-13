// Push Notification Service for Spyll Mobile App
// Handles Firebase Cloud Messaging for both Android and iOS

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

const API_BASE_URL = 'https://spyll.in';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.notificationListeners = [];
    this.userId = null;
  }

  /**
   * Create notification channels for Android
   */
  async createNotificationChannels() {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      // Create main notification channel
      await PushNotifications.createChannel({
        id: 'spyll-notifications',
        name: 'Spyll Notifications',
        description: 'Notifications from Spyll app',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        sound: 'notification',
        vibration: true,
        lights: true,
        lightColor: '#FF5973',
      });

      // Create channel for user waiting notifications
      await PushNotifications.createChannel({
        id: 'spyll-users-waiting',
        name: 'Users Waiting',
        description: 'Notifications when users are waiting to chat or call',
        importance: 4,
        visibility: 1,
        sound: 'notification',
        vibration: true,
      });

      console.log('[Push] Notification channels created');
    } catch (error) {
      console.error('[Push] Error creating notification channels:', error);
    }
  }

  /**
   * Initialize push notifications
   * Call this after user login/verification or with unverified user ID
   */
  async initialize(userId) {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Not a native platform, skipping initialization');
      return { success: false, reason: 'not-native' };
    }

    if (this.isInitialized && this.userId === userId) {
      console.log('[Push] Already initialized for this user');
      return { success: true, token: this.deviceToken };
    }

    this.userId = userId;

    try {
      // Create notification channels first (Android 8+)
      await this.createNotificationChannels();

      // Request permission
      const permStatus = await PushNotifications.checkPermissions();
      console.log('[Push] Current permission status:', permStatus.receive);
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.log('[Push] Permission denied by user');
          return { success: false, reason: 'permission-denied' };
        }
      } else if (permStatus.receive !== 'granted') {
        console.log('[Push] Permission not granted, status:', permStatus.receive);
        return { success: false, reason: 'permission-not-granted' };
      }

      // Register for push notifications
      await PushNotifications.register();

      // Set up listeners
      this.setupListeners(userId);
      this.isInitialized = true;

      console.log('[Push] Initialization complete');
      return { success: true };
    } catch (error) {
      console.error('[Push] Initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up push notification listeners
   */
  setupListeners(userId) {
    // On registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Registration successful:', token.value);
      this.deviceToken = token.value;
      
      // Send token to server
      await this.registerTokenWithServer(userId, token.value);
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Registration error:', error);
    });

    // On push notification received (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notification received:', notification);
      
      // Show local notification when app is in foreground
      this.showLocalNotification(notification);
      
      // Notify listeners
      this.notificationListeners.forEach(listener => listener(notification));
    });

    // On push notification action (user tapped)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Notification action performed:', action);
      
      // Handle navigation based on notification data
      this.handleNotificationAction(action.notification);
    });
  }

  /**
   * Register device token with server
   */
  async registerTokenWithServer(userId, token) {
    try {
      const platform = Capacitor.getPlatform();
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
          platform,
          deviceInfo: {
            platform,
            isNative: true,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('[Push] Token registered with server');
      } else {
        console.error('[Push] Failed to register token:', data.error);
      }
      
      return data;
    } catch (error) {
      console.error('[Push] Error registering token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Show local notification (for foreground notifications)
   */
  async showLocalNotification(notification) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || 'Spyll',
            body: notification.body || '',
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'notification.wav',
            attachments: null,
            actionTypeId: '',
            extra: notification.data,
          },
        ],
      });
    } catch (error) {
      console.error('[Push] Error showing local notification:', error);
    }
  }

  /**
   * Handle notification tap action
   */
  handleNotificationAction(notification) {
    const data = notification.data || {};
    
    // Navigate based on notification type
    switch (data.type) {
      case 'users_waiting_chat':
        window.location.href = '/random-chat';
        break;
      case 'users_waiting_call':
        window.location.href = '/random-call';
        break;
      case 'new_confession':
        if (data.confessionId) {
          window.location.href = `/confession/${data.confessionId}`;
        } else {
          window.location.href = '/all-confessions';
        }
        break;
      case 'new_message':
        window.location.href = '/inbox';
        break;
      default:
        window.location.href = '/';
    }
  }

  /**
   * Add notification listener
   */
  addListener(callback) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== callback);
    };
  }

  /**
   * Unregister device (on logout)
   */
  async unregisterDevice(userId) {
    if (!this.deviceToken) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/unregister-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: this.deviceToken,
        }),
      });

      this.deviceToken = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('[Push] Error unregistering device:', error);
    }
  }

  /**
   * Get current device token
   */
  getToken() {
    return this.deviceToken;
  }

  /**
   * Check if running on native platform
   */
  isNative() {
    return Capacitor.isNativePlatform();
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
