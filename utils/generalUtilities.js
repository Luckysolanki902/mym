export const scrollToBottom = (containerRef) => {
    if (!containerRef?.current) return;
    
    const container = containerRef.current;
    
    // Use requestAnimationFrame for smooth, reliable scrolling
    requestAnimationFrame(() => {
        // Method 1: Try scrollIntoView on last child
        const lastChild = container.lastElementChild;
        if (lastChild) {
            try {
                lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } catch (e) {
                // Fallback: direct scroll
                container.scrollTop = container.scrollHeight;
            }
        } else {
            // Method 2: Direct scroll if no children
            container.scrollTop = container.scrollHeight;
        }
    });
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

export const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours === 1) return '1h ago';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (weeks === 1) return '1w ago';
    if (weeks < 4) return `${weeks}w ago`;
    if (months === 1) return '1mo ago';
    if (months < 12) return `${months}mo ago`;
    if (years === 1) return '1y ago';
    return `${years}y ago`;
};
