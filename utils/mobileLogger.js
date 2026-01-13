// Mobile Logger - Saves logs to device storage for debugging production issues
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const MAX_LOG_SIZE = 500 * 1024; // 500KB max log file size
const MAX_LOG_FILES = 5; // Keep last 5 log files
const LOG_FILENAME = 'spyll-debug.log';

class MobileLogger {
  constructor() {
    this.buffer = [];
    this.isNative = false;
    this.flushInterval = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.isNative = Capacitor.isNativePlatform();
      
      if (this.isNative) {
        // Flush logs every 5 seconds
        this.flushInterval = setInterval(() => this.flush(), 5000);
        
        // Override console methods
        this.overrideConsole();
        
        // Log startup
        this.log('INFO', '=== Spyll App Started ===');
        this.log('INFO', `Platform: ${Capacitor.getPlatform()}`);
        this.log('INFO', `Native: ${this.isNative}`);
        this.log('INFO', `Time: ${new Date().toISOString()}`);
      }
      
      this.initialized = true;
    } catch (e) {
      // Silently fail
    }
  }

  overrideConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog.apply(console, args);
      this.log('LOG', args.map(a => this.stringify(a)).join(' '));
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      this.log('ERROR', args.map(a => this.stringify(a)).join(' '));
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.log('WARN', args.map(a => this.stringify(a)).join(' '));
    };

    // Catch uncaught errors
    if (typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        this.log('CRASH', `${message} at ${source}:${lineno}:${colno}`);
        if (error?.stack) {
          this.log('STACK', error.stack);
        }
        this.flush(); // Immediately flush on crash
        return false;
      };

      window.onunhandledrejection = (event) => {
        this.log('UNHANDLED', `Promise rejection: ${this.stringify(event.reason)}`);
        this.flush(); // Immediately flush on unhandled rejection
      };
    }
  }

  stringify(obj) {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (obj instanceof Error) return `${obj.message}\n${obj.stack || ''}`;
    try {
      return JSON.stringify(obj, null, 0);
    } catch {
      return String(obj);
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${level}] ${message}`;
    this.buffer.push(entry);
    
    // Keep buffer manageable
    if (this.buffer.length > 1000) {
      this.buffer = this.buffer.slice(-500);
    }
  }

  async flush() {
    if (!this.isNative || this.buffer.length === 0) return;

    try {
      const logs = this.buffer.join('\n') + '\n';
      this.buffer = [];

      // Try to read existing file
      let existingContent = '';
      try {
        const existing = await Filesystem.readFile({
          path: LOG_FILENAME,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        existingContent = existing.data || '';
      } catch {
        // File doesn't exist yet
      }

      // Append new logs
      let newContent = existingContent + logs;

      // Trim if too large (keep last part)
      if (newContent.length > MAX_LOG_SIZE) {
        const lines = newContent.split('\n');
        newContent = lines.slice(-5000).join('\n');
      }

      // Write back
      await Filesystem.writeFile({
        path: LOG_FILENAME,
        data: newContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (e) {
      // Silently fail - don't want logging to crash the app
    }
  }

  async getLogs() {
    if (!this.isNative) return 'Not on native platform';

    try {
      const result = await Filesystem.readFile({
        path: LOG_FILENAME,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return result.data || 'No logs found';
    } catch {
      return 'No logs found';
    }
  }

  async clearLogs() {
    if (!this.isNative) return;

    try {
      await Filesystem.deleteFile({
        path: LOG_FILENAME,
        directory: Directory.Documents,
      });
      this.log('INFO', '=== Logs Cleared ===');
    } catch {
      // File might not exist
    }
  }

  async shareLogs() {
    if (!this.isNative) return;

    try {
      // Flush current buffer first
      await this.flush();

      const { Share } = await import('@capacitor/share');
      const logs = await this.getLogs();
      
      await Share.share({
        title: 'Spyll Debug Logs',
        text: logs,
        dialogTitle: 'Share Debug Logs',
      });
    } catch (e) {
      console.error('Failed to share logs:', e);
    }
  }

  async getLogFileUri() {
    if (!this.isNative) return null;

    try {
      const result = await Filesystem.getUri({
        path: LOG_FILENAME,
        directory: Directory.Documents,
      });
      return result.uri;
    } catch {
      return null;
    }
  }
}

export const mobileLogger = new MobileLogger();
export default mobileLogger;
