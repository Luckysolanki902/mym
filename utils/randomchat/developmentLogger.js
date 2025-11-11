// utils/randomchat/developmentLogger.js

/**
 * Development logger for frontend with colored console output
 * Only logs when NEXT_PUBLIC_NODE_ENV === 'development'
 */

const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === 'development';

/**
 * Log categories with their colors and styling
 */
const LOG_STYLES = {
  SOCKET: {
    badge: 'background: #2196f3; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #2196f3;',
    emoji: '🔌'
  },
  QUEUE: {
    badge: 'background: #00bcd4; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #00bcd4;',
    emoji: '⏳'
  },
  PAIRING: {
    badge: 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #4caf50;',
    emoji: '🤝'
  },
  FILTER: {
    badge: 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #ff9800;',
    emoji: '🔍'
  },
  MESSAGE: {
    badge: 'background: #9c27b0; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #9c27b0;',
    emoji: '💬'
  },
  ERROR: {
    badge: 'background: #f44336; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #f44336;',
    emoji: '❌'
  },
  SUCCESS: {
    badge: 'background: #4caf50; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #4caf50;',
    emoji: '✅'
  },
  WARNING: {
    badge: 'background: #ff9800; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #ff9800;',
    emoji: '⚠️'
  },
  INFO: {
    badge: 'background: #607d8b; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    text: 'color: #607d8b;',
    emoji: 'ℹ️'
  }
};

/**
 * Logger class with colored output for development
 */
class DevelopmentLogger {
  /**
   * Log a socket event
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  socket(message, data = null) {
    if (!isDevelopment) return;
    this._log('SOCKET', message, data);
  }

  /**
   * Log a queue event
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  queue(message, data = null) {
    if (!isDevelopment) return;
    this._log('QUEUE', message, data);
  }

  /**
   * Log a pairing event
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  pairing(message, data = null) {
    if (!isDevelopment) return;
    this._log('PAIRING', message, data);
  }

  /**
   * Log a filter event
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  filter(message, data = null) {
    if (!isDevelopment) return;
    this._log('FILTER', message, data);
  }

  /**
   * Log a message event
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  message(message, data = null) {
    if (!isDevelopment) return;
    this._log('MESSAGE', message, data);
  }

  /**
   * Log an error
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  error(message, data = null) {
    if (!isDevelopment) return;
    this._log('ERROR', message, data);
  }

  /**
   * Log a success message
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  success(message, data = null) {
    if (!isDevelopment) return;
    this._log('SUCCESS', message, data);
  }

  /**
   * Log a warning
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  warning(message, data = null) {
    if (!isDevelopment) return;
    this._log('WARNING', message, data);
  }

  /**
   * Log an info message
   * @param {string} message - The log message
   * @param {object} data - Optional data object to display
   */
  info(message, data = null) {
    if (!isDevelopment) return;
    this._log('INFO', message, data);
  }

  /**
   * Internal method to format and output logs
   * @param {string} category - Log category
   * @param {string} message - The log message
   * @param {object} data - Optional data object
   * @private
   */
  _log(category, message, data) {
    const style = LOG_STYLES[category];
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    if (data) {
      console.groupCollapsed(
        `%c${style.emoji} ${category}%c ${timestamp} - ${message}`,
        style.badge,
        style.text
      );
      console.log(data);
      console.groupEnd();
    } else {
      console.log(
        `%c${style.emoji} ${category}%c ${timestamp} - ${message}`,
        style.badge,
        style.text
      );
    }
  }

  /**
   * Log queue status with formatted display
   * @param {object} data - Queue status data from backend
   */
  queueStatus(data) {
    if (!isDevelopment) return;
    
    const style = LOG_STYLES.QUEUE;
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    console.groupCollapsed(
      `%c${style.emoji} QUEUE STATUS%c ${timestamp} - Position: ${data.position}, Wait: ${(data.waitTimeMs / 1000).toFixed(1)}s`,
      style.badge,
      style.text
    );
    console.table({
      'Queue Position': data.position,
      'Wait Time': `${(data.waitTimeMs / 1000).toFixed(1)}s`,
      'Filter Level': data.filterLevel,
      'Description': data.description,
      'Total in Queue': data.queueLength
    });
    console.groupEnd();
  }

  /**
   * Log filter level change with formatted display
   * @param {object} data - Filter level data from backend
   */
  filterLevelChange(data) {
    if (!isDevelopment) return;
    
    const style = LOG_STYLES.FILTER;
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    console.log(
      `%c${style.emoji} FILTER LEVEL ${data.newLevel}%c ${timestamp} - ${data.description}`,
      style.badge,
      style.text
    );
  }

  /**
   * Log pairing success with formatted display
   * @param {object} data - Pairing success data
   */
  pairingSuccess(data) {
    if (!isDevelopment) return;
    
    const style = LOG_STYLES.SUCCESS;
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    console.groupCollapsed(
      `%c${style.emoji} PAIRING SUCCESS%c ${timestamp} - Matched with ${data.receiver}`,
      style.badge,
      style.text
    );
    console.table({
      'Room': data.room,
      'Partner': data.receiver,
      'Partner Gender': data.strangerGender,
      'Verified': data.isStrangerVerified ? 'Yes' : 'No'
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const devLogger = new DevelopmentLogger();

// Export for named imports
export default devLogger;
