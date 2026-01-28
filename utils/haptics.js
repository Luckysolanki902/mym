// utils/haptics.js
/**
 * Haptic feedback utility for Capacitor apps
 * Provides subtle, soothing haptic feedback for user interactions
 */

let Haptics = null;
let Capacitor = null;

// Dynamically import Capacitor modules (only works in browser/native environment)
const initHaptics = async () => {
    if (typeof window === 'undefined') return false;

    try {
        if (!Haptics) {
            const hapticModule = await import('@capacitor/haptics');
            Haptics = hapticModule.Haptics;
        }
        if (!Capacitor) {
            const capacitorModule = await import('@capacitor/core');
            Capacitor = capacitorModule.Capacitor;
        }
        return true;
    } catch (error) {
        console.log('[Haptics] Not available in this environment');
        return false;
    }
};

/**
 * Trigger a very soft, subtle haptic feedback
 * Use for: message arrivals, likes
 */
export const triggerSoftHaptic = async () => {
    const initialized = await initHaptics();
    if (!initialized || !Capacitor?.isNativePlatform()) return;

    try {
        await Haptics.impact({ style: 'light' });
    } catch (error) {
        console.log('[Haptics] Soft haptic failed:', error.message);
    }
};

/**
 * Trigger a medium haptic feedback
 * Use for: successful connections (chat/call pairing)
 */
export const triggerMediumHaptic = async () => {
    const initialized = await initHaptics();
    if (!initialized || !Capacitor?.isNativePlatform()) return;

    try {
        await Haptics.impact({ style: 'medium' });
    } catch (error) {
        console.log('[Haptics] Medium haptic failed:', error.message);
    }
};

/**
 * Trigger a notification-style haptic feedback
 * Use for: disconnections, partner leaving
 */
export const triggerNotificationHaptic = async () => {
    const initialized = await initHaptics();
    if (!initialized || !Capacitor?.isNativePlatform()) return;

    try {
        await Haptics.notification({ type: 'warning' });
    } catch (error) {
        console.log('[Haptics] Notification haptic failed:', error.message);
    }
};
