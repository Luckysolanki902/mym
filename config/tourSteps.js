// config/tourSteps.js
// Tour step configurations for different pages

export const textChatTourSteps = [
  {
    target: '[data-tour="filter-button"]',
    title: 'Filter Your Matches',
    description: 'Click the d/dx (differentiate) button to open filters and customize who you want to chat with.',
    icon: '🎯',
    placement: 'left',
    padding: 12,
    borderRadius: 16,
    delay: 100,
    action: 'close-filter', // Signal to close filter if open
  },
  {
    target: '[data-tour="filter-menu"]',
    title: 'Choose Your Preferences',
    description: 'Select your preferred gender and college to find the perfect match. You can chat with anyone or be specific!',
    icon: '⚙️',
    placement: 'left',
    padding: 12,
    borderRadius: 20,
    delay: 300,
    action: 'open-filter', // Signal to open filter
  },
  {
    target: '[data-tour="find-new-button"]',
    title: 'Find New People',
    description: 'Hit "Find New" to start searching for someone to chat with. Each click connects you with a new stranger!',
    icon: '🔍',
    placement: 'top',
    padding: 8,
    borderRadius: 100,
    delay: 100,
    action: 'close-filter',
  },
  {
    target: null, // Center of screen
    title: 'Our Smart Queue System',
    description: 'We try our best to match you with your preferences, but if no one\'s available, you might be paired with someone different. The more flexible you are, the faster you\'ll connect!',
    icon: '⏳',
    placement: 'center',
    tip: 'Pro tip: Keep "Any Gender" and "Any College" for the fastest matches!',
    delay: 100,
  },
  {
    target: null,
    title: 'You\'re All Set! 🎉',
    description: 'Start chatting anonymously with verified college students. Your identity is always protected. Have fun and be respectful!',
    icon: '💬',
    placement: 'center',
    delay: 100,
  },
];

export const audioCallTourSteps = [
  {
    target: '[data-tour="call-filter-button"] [data-tour="filter-button"]',
    title: 'Filter Your Calls',
    description: 'Click the d/dx button to set your preferences for voice calls.',
    icon: '🎯',
    placement: 'left',
    padding: 12,
    borderRadius: 16,
    delay: 100,
    action: 'close-filter',
  },
  {
    target: '[data-tour="filter-menu"]',
    title: 'Choose Who to Talk To',
    description: 'Select gender and college preferences for your anonymous voice calls.',
    icon: '⚙️',
    placement: 'left',
    padding: 12,
    borderRadius: 20,
    delay: 300,
    action: 'open-filter',
  },
  {
    target: '[data-tour="start-call-button"]',
    title: 'Start a Call',
    description: 'Press "Start Call" to begin searching for someone to talk with. Make sure your microphone is ready!',
    icon: '📞',
    placement: 'top',
    padding: 8,
    borderRadius: 100,
    delay: 100,
    action: 'close-filter',
  },
  {
    target: null,
    title: 'Voice Call Queue',
    description: 'We\'ll try to match you with your preferences. If the queue is long, consider being more flexible with your filters for faster connections!',
    icon: '🎧',
    placement: 'center',
    tip: 'Keep your microphone unmuted and speak clearly. Remember, the other person can\'t see you!',
    delay: 100,
  },
  {
    target: null,
    title: 'Ready to Call! 🎉',
    description: 'Talk anonymously with real college students. Your voice is your only identity here. Be yourself and have great conversations!',
    icon: '🗣️',
    placement: 'center',
    delay: 100,
  },
];

export const confessionsTourSteps = [
  {
    target: '[data-tour="sort-tabs"]',
    title: 'Sort Confessions',
    description: 'Browse confessions by Trending (most liked), New (latest), or from your own college.',
    icon: '📊',
    placement: 'bottom',
    padding: 8,
    borderRadius: 12,
    delay: 100,
  },
  {
    target: null,
    title: 'Gender Colors',
    description: 'Notice the background colors? 💗 Pink = Female confessor, 💙 Cyan/Blue = Male confessor. The color changes as you scroll!',
    icon: '🎨',
    placement: 'center',
    delay: 100,
  },
  {
    target: '[data-tour="dm-reply-button"]',
    title: 'Reply Anonymously via DM',
    description: 'Want to respond privately to a confessor? Tap here to send them an anonymous DM. They won\'t know who you are!',
    icon: '✉️',
    placement: 'top',
    padding: 8,
    borderRadius: 12,
    delay: 100,
  },
  {
    target: '[data-tour="share-button"]',
    title: 'Share Confessions',
    description: 'Found something relatable? Share it with your friends on social media!',
    icon: '🔗',
    placement: 'top',
    padding: 8,
    borderRadius: 8,
    delay: 100,
  },
  {
    target: null,
    title: 'Explore Confessions! 🎉',
    description: 'Read, react, and engage with anonymous confessions from your college community. Be respectful and have fun!',
    icon: '💭',
    placement: 'center',
    delay: 100,
  },
];

export const confessionDetailTourSteps = [
  {
    target: null,
    title: 'Gender-Based Colors',
    description: 'The background color tells you about the confessor: 💗 Pink = Female, 💙 Blue/Cyan = Male.',
    icon: '🎨',
    placement: 'center',
    delay: 100,
  },
  {
    target: '[data-tour="dm-reply-button"]',
    title: 'Reply Anonymously via DM',
    description: 'Send a private message to the confessor. Your identity stays hidden!',
    icon: '✉️',
    placement: 'top',
    padding: 8,
    borderRadius: 12,
    delay: 100,
  },
  {
    target: '[data-tour="share-button"]',
    title: 'Share This Confession',
    description: 'Found this interesting? Share it with your friends!',
    icon: '🔗',
    placement: 'top',
    padding: 8,
    borderRadius: 8,
    delay: 100,
  },
  {
    target: null,
    title: 'You\'re All Set! 🎉',
    description: 'Engage with confessions, send anonymous DMs, and explore more stories from your campus!',
    icon: '🎭',
    placement: 'center',
    delay: 100,
  },
];

// Helper to get tour steps by name
export const getTourSteps = (tourName) => {
  switch (tourName) {
    case 'textChat':
      return textChatTourSteps;
    case 'audioCall':
      return audioCallTourSteps;
    case 'confessions':
      return confessionsTourSteps;
    case 'confessionDetail':
      return confessionDetailTourSteps;
    default:
      return [];
  }
};
