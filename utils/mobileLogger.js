// Mobile Logger - Saves logs to device storage for debugging production issues
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const MAX_LOG_SIZE = 500 * 1024; // 500KB max log file size
const MAX_LOG_FILES = 5; // Keep last 5 log files
const LOG_FILENAME = 'spyll-debug.log';
const CRASH_LOG_FILENAME = 'spyll-crashes.log';
const MAX_CRASH_LOG_SIZE = 1024 * 1024; // 1MB for crash logs
const MAX_CRASHES = 50; // Keep last 50 crashes

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
        
        // Log startup with device info
        await this.logStartup();
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
        const crashInfo = {
          type: 'ERROR',
          message: String(message),
          source,
          line: lineno,
          column: colno,
          stack: error?.stack || 'No stack trace',
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        
        this.log('CRASH', `${message} at ${source}:${lineno}:${colno}`);
        if (error?.stack) {
          this.log('STACK', error.stack);
        }
        
        // Save to crash log
        this.logCrash(crashInfo);
        this.flush(); // Immediately flush on crash
        return false;
      };

      window.onunhandledrejection = (event) => {
        const reason = event.reason;
        const crashInfo = {
          type: 'UNHANDLED_REJECTION',
          message: reason?.message || String(reason),
          stack: reason?.stack || 'No stack trace',
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        
        this.log('UNHANDLED', `Promise rejection: ${this.stringify(reason)}`);
        
        // Save to crash log
        this.logCrash(crashInfo);
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

  async logStartup() {
    try {
      const { Device } = await import('@capacitor/device');
      const deviceInfo = await Device.getInfo();
      const deviceId = await Device.getId();
      
      this.log('INFO', '=== Spyll App Started ===');
      this.log('INFO', `App Version: ${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`);
      this.log('INFO', `Platform: ${Capacitor.getPlatform()}`);
      this.log('INFO', `Device Model: ${deviceInfo.model}`);
      this.log('INFO', `OS Version: ${deviceInfo.osVersion}`);
      this.log('INFO', `Device ID: ${deviceId.identifier}`);
      this.log('INFO', `Time: ${new Date().toISOString()}`);
    } catch (e) {
      this.log('INFO', '=== Spyll App Started ===');
      this.log('INFO', `Platform: ${Capacitor.getPlatform()}`);
      this.log('INFO', `Time: ${new Date().toISOString()}`);
    }
  }

  async logCrash(crashInfo) {
    if (!this.isNative) return;

    try {
      const crashEntry = [
        '\n' + '='.repeat(80),
        `CRASH REPORT - ${crashInfo.timestamp}`,
        '='.repeat(80),
        `Type: ${crashInfo.type}`,
        `Message: ${crashInfo.message}`,
        crashInfo.source ? `Source: ${crashInfo.source}:${crashInfo.line}:${crashInfo.column}` : '',
        `URL: ${crashInfo.url}`,
        `User Agent: ${crashInfo.userAgent}`,
        '',
        'Stack Trace:',
        crashInfo.stack,
        '='.repeat(80),
        ''
      ].filter(Boolean).join('\n');

      // Read existing crash log
      let existingCrashes = '';
      try {
        const existing = await Filesystem.readFile({
          path: CRASH_LOG_FILENAME,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        existingCrashes = existing.data || '';
      } catch {
        // File doesn't exist yet
      }

      // Append new crash
      let newContent = existingCrashes + crashEntry;

      // Trim if too large (keep last crashes)
      if (newContent.length > MAX_CRASH_LOG_SIZE) {
        const crashes = newContent.split('='.repeat(80));
        newContent = crashes.slice(-MAX_CRASHES).join('='.repeat(80));
      }

      // Write crash log
      await Filesystem.writeFile({
        path: CRASH_LOG_FILENAME,
        data: newContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (e) {
      // Silently fail
    }
  }

  async getCrashLogs() {
    if (!this.isNative) return 'Not on native platform';

    try {
      const result = await Filesystem.readFile({
        path: CRASH_LOG_FILENAME,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return result.data || 'No crash logs found';
    } catch {
      return 'No crash logs found';
    }
  }

  async clearCrashLogs() {
    if (!this.isNative) return;

    try {
      await Filesystem.deleteFile({
        path: CRASH_LOG_FILENAME,
        directory: Directory.Documents,
      });
      this.log('INFO', '=== Crash Logs Cleared ===');
    } catch {
      // File might not exist
    }
  }

  async getAllLogs() {
    const debugLogs = await this.getLogs();
    const crashLogs = await this.getCrashLogs();
    
    return {
      debugLogs,
      crashLogs,
      combined: `${'='.repeat(80)}\nDEBUG LOGS\n${'='.repeat(80)}\n${debugLogs}\n\n${'='.repeat(80)}\nCRASH LOGS\n${'='.repeat(80)}\n${crashLogs}`
    };
  }

  async shareAllLogs() {
    if (!this.isNative) return;

    try {
      await this.flush();
      const { Share } = await import('@capacitor/share');
      const { combined } = await this.getAllLogs();
      
      await Share.share({
        title: 'Spyll Debug & Crash Logs',
        text: combined,
        dialogTitle: 'Share All Logs',
      });
    } catch (e) {
      console.error('Failed to share logs:', e);
    }
  }

  async getCrashCount() {
    try {
      const crashLogs = await this.getCrashLogs();
      const crashes = crashLogs.split('CRASH REPORT -');
      return Math.max(0, crashes.length - 1); // -1 because split creates empty first element
    } catch {
      return 0;
    }
  }
}

export const mobileLogger = new MobileLogger();
export default mobileLogger;
