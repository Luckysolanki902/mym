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

        const { StatusBar } = await import('@capacitor/status-bar');
        
        // Configure status bar for Android
        if (Capacitor.getPlatform() === 'android') {
          // Set status bar to overlay the app content
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Set status bar background color to white/light
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          
          // Set status bar text to dark (for light background)
          await StatusBar.setStyle({ style: 'LIGHT' });
          
          console.log('✅ Android StatusBar configured');
        }
      } catch (error) {
        console.log('StatusBar setup skipped:', error.message);
      }
    };

    initStatusBar();
  }, []);

  return null; // No UI
}
