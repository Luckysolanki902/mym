// Push Notification Service for Spyll Mobile App
// Handles Firebase Cloud Messaging for both Android and iOS

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

// Use the same base URL as the app is loaded from, or fallback to production
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'https://spyll.in';

console.log('[Push] API Base URL:', API_BASE_URL);

// Rate limiting constants
const CHAT_QUEUE_NOTIFICATIONS_PER_HOUR = 2;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.notificationListeners = [];
    this.userId = null;
    // Track chat queue notification timestamps for rate limiting
    this.chatQueueNotificationTimestamps = this.loadNotificationTimestamps();
    // Track last shown queue count for smart upgrade notifications
    this.lastQueueCount = this.loadLastQueueCount();
  }

  /**
   * Load notification timestamps from localStorage
   */
  loadNotificationTimestamps() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('spyll_chat_queue_notification_times');
      if (stored) {
        const timestamps = JSON.parse(stored);
        // Filter out timestamps older than 1 hour
        const now = Date.now();
        return timestamps.filter(ts => (now - ts) < RATE_LIMIT_WINDOW_MS);
      }
    } catch (e) {
      console.log('[Push] Error loading notification timestamps:', e);
    }
    return [];
  }

  /**
   * Save notification timestamps to localStorage
   */
  saveNotificationTimestamps() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('spyll_chat_queue_notification_times', JSON.stringify(this.chatQueueNotificationTimestamps));
    } catch (e) {
      console.log('[Push] Error saving notification timestamps:', e);
    }
  }

  /**
   * Load last queue count from localStorage
   */
  loadLastQueueCount() {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem('spyll_last_queue_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Save last queue count to localStorage
   */
  saveLastQueueCount(count) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('spyll_last_queue_count', String(count));
      this.lastQueueCount = count;
    } catch (e) {
      console.log('[Push] Error saving queue count:', e);
    }
  }

  /**
   * Extract queue count from notification
   */
  extractQueueCount(notification) {
    // Try to get from data first
    const data = notification.data || {};
    if (data.count) return parseInt(data.count, 10);
    if (data.queueCount) return parseInt(data.queueCount, 10);
    
    // Try to extract from body text (e.g., "5 users waiting")
    const body = notification.body || '';
    const match = body.match(/(\d+)\s*(users?|people)/i);
    if (match) return parseInt(match[1], 10);
    
    return 0;
  }

  /**
   * Check if a chat queue notification should be shown
   * Smart logic: always allow if count increased (upgrade), rate limit otherwise
   * @param {object} notification - The notification object
   * @returns {object} { allowed: boolean, silent: boolean } - silent means replace without sound
   */
  shouldShowChatQueueNotification(notification) {
    const now = Date.now();
    const newCount = this.extractQueueCount(notification);
    
    // Remove timestamps older than 1 hour
    this.chatQueueNotificationTimestamps = this.chatQueueNotificationTimestamps.filter(
      ts => (now - ts) < RATE_LIMIT_WINDOW_MS
    );
    
    // If this is an upgrade (more users now), always show but silently replace
    if (newCount > this.lastQueueCount && newCount > 0) {
      console.log(`[Push] Queue count upgrade: ${this.lastQueueCount} → ${newCount}, allowing silent update`);
      this.saveLastQueueCount(newCount);
      // Don't count as a rate-limited notification, just update silently
      return { allowed: true, silent: true };
    }
    
    // Reset count tracking if queue is empty or decreased significantly
    if (newCount === 0 || newCount < this.lastQueueCount) {
      this.saveLastQueueCount(newCount);
    }
    
    // Check if under the limit for non-upgrade notifications
    if (this.chatQueueNotificationTimestamps.length < CHAT_QUEUE_NOTIFICATIONS_PER_HOUR) {
      this.chatQueueNotificationTimestamps.push(now);
      this.saveNotificationTimestamps();
      this.saveLastQueueCount(newCount);
      console.log(`[Push] Chat queue notification allowed (${this.chatQueueNotificationTimestamps.length}/${CHAT_QUEUE_NOTIFICATIONS_PER_HOUR} this hour)`);
      return { allowed: true, silent: false };
    }
    
    console.log(`[Push] Chat queue notification rate limited (${this.chatQueueNotificationTimestamps.length}/${CHAT_QUEUE_NOTIFICATIONS_PER_HOUR} this hour)`);
    return { allowed: false, silent: false };
  }

  /**
   * Check if notification is a chat queue notification
   */
  isChatQueueNotification(notification) {
    const data = notification.data || {};
    const type = data.type || '';
    // Check for chat/call waiting notifications
    return type === 'users_waiting_chat' || 
           type === 'users_waiting_call' ||
           type.includes('waiting') ||
           (notification.title && notification.title.includes('waiting'));
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

      // Check if push notifications are available
      let permStatus;
      try {
        permStatus = await PushNotifications.checkPermissions();
        console.log('[Push] Current permission status:', permStatus.receive);
      } catch (permError) {
        console.log('[Push] Error checking permissions:', permError.message);
        return { success: false, reason: 'permission-check-failed', error: permError.message };
      }
      
      if (permStatus.receive === 'prompt') {
        try {
          const result = await PushNotifications.requestPermissions();
          if (result.receive !== 'granted') {
            console.log('[Push] Permission denied by user');
            return { success: false, reason: 'permission-denied' };
          }
        } catch (reqError) {
          console.log('[Push] Error requesting permissions:', reqError.message);
          return { success: false, reason: 'permission-request-failed', error: reqError.message };
        }
      } else if (permStatus.receive !== 'granted') {
        console.log('[Push] Permission not granted, status:', permStatus.receive);
        return { success: false, reason: 'permission-not-granted' };
      }

      // Set up listeners BEFORE registration
      this.setupListeners(userId);

      // Register for push notifications with error handling
      try {
        await PushNotifications.register();
        console.log('[Push] Registration started');
      } catch (regError) {
        console.log('[Push] Registration error:', regError.message);
        return { success: false, reason: 'registration-failed', error: regError.message };
      }

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
      
      let silent = false;
      
      // Check if this is a chat queue notification and apply smart rate limiting
      if (this.isChatQueueNotification(notification)) {
        const result = this.shouldShowChatQueueNotification(notification);
        if (!result.allowed) {
          console.log('[Push] Skipping chat queue notification due to rate limit');
          return; // Don't show this notification
        }
        silent = result.silent; // Silent updates for queue count upgrades
      }
      
      // Show local notification when app is in foreground
      this.showLocalNotification(notification, silent);
      
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
   * @param {object} notification - The notification to show
   * @param {boolean} silent - If true, show without sound (for silent updates)
   */
  async showLocalNotification(notification, silent = false) {
    try {
      const notificationConfig = {
        title: notification.title || 'Spyll',
        body: notification.body || '',
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 100) },
        channelId: 'spyll-notifications',
        extra: notification.data,
        smallIcon: 'ic_notification',
        largeIcon: 'ic_launcher',
      };
      
      // Add sound only if not silent
      if (!silent) {
        notificationConfig.sound = 'default'; // Use system default sound
      }
      
      await LocalNotifications.schedule({
        notifications: [notificationConfig],
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
