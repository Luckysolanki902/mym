import { useEffect } from 'react';

export default function StatusBarHandler() {
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
          return;
        }

        // Add native class to body for CSS targeting
        document.body.classList.add('native-app');
        if (Capacitor.getPlatform() === 'android') {
          document.body.classList.add('platform-android');
        } else if (Capacitor.getPlatform() === 'ios') {
          document.body.classList.add('platform-ios');
        }

        const { StatusBar } = await import('@capacitor/status-bar');
        const { Keyboard } = await import('@capacitor/keyboard');
        
        // Configure status bar for Android
        if (Capacitor.getPlatform() === 'android') {
          // IMPORTANT: Let WebView extend under status bar, CSS handles safe areas
          await StatusBar.setOverlaysWebView({ overlay: true });
          
          // Set status bar text to dark (for light content behind)
          await StatusBar.setStyle({ style: 'DARK' });

          // Use native resize mode - prevents black gap above keyboard
          await Keyboard.setResizeMode({ mode: 'native' });
          
          console.log('✅ Android StatusBar configured (overlay mode)');
        }
        
        // Configure for iOS
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: 'DARK' });
          console.log('✅ iOS StatusBar configured');
        }
      } catch (error) {
        console.log('StatusBar setup skipped:', error.message);
      }
    };

    initStatusBar();
  }, []);

  return null; // No UI
}
