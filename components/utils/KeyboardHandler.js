import { useEffect } from 'react';

export default function KeyboardHandler() {
  useEffect(() => {
    const initKeyboard = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
          return;
        }

        const { Keyboard } = await import('@capacitor/keyboard');
        
        // Configure keyboard behavior for Android
        if (Capacitor.getPlatform() === 'android') {
          // Set keyboard to resize mode (pushes content up)
          await Keyboard.setResizeMode({ mode: 'native' });
          
          // Keep keyboard open after form submission
          await Keyboard.setScroll({ isDisabled: false });
          
          console.log('✅ Android Keyboard configured');
        }
        
        // Listen for keyboard events
        Keyboard.addListener('keyboardWillShow', info => {
          console.log('Keyboard will show with height:', info.keyboardHeight);
        });

        Keyboard.addListener('keyboardDidShow', info => {
          console.log('Keyboard shown');
        });

        return () => {
          Keyboard.removeAllListeners();
        };
      } catch (error) {
        console.log('Keyboard setup skipped:', error.message);
      }
    };

    initKeyboard();
  }, []);

  return null;
}
