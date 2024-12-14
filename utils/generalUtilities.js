export const scrollToBottom = (containerRef) => {
    if (containerRef.current) {
        const container = containerRef.current;
        const lastEnd = container.lastElementChild;
        if (lastEnd) {
            lastEnd.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest', inlineSize: 1 });
        }
    }
};

// A utility function for adding soothing vibration effects in a Next.js app
export function triggerVibration({
    duration = 200, // Vibration duration in milliseconds (default: 200ms)
    strength = 0.5, // Vibration strength (default: 0.5, ranges from 0 to 1)
    interval = 0,  // Interval between vibrations in a pattern (default: no interval)
    repeat = 1     // Number of repetitions (default: 1)
  } = {}) {
    // Check if the browser supports vibration
    if (!navigator.vibrate) {
      console.warn("Vibration API is not supported in this browser.");
      return;
    }
  
    // Normalize strength to fit within a soothing range (0 to 1)
    const normalizedStrength = Math.max(0, Math.min(1, strength));
  
    // Calculate vibration pattern based on strength and repetitions
    const singleVibration = duration * normalizedStrength;
    const pattern = Array(repeat).fill([singleVibration, interval]).flat();
  
    // Trigger vibration using the pattern
    navigator.vibrate(pattern);
  }
  