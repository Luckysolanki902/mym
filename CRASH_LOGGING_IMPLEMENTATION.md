# Crash Logging System - Implementation Guide

## Overview
The Spyll app now has a comprehensive crash logging system that automatically captures and stores all errors and crashes on the device for production debugging.

## Features

### 1. **Automatic Crash Capture**
- Catches all uncaught JavaScript errors
- Captures unhandled promise rejections
- Logs React component errors via Error Boundary
- Records full stack traces and error context

### 2. **Persistent Storage**
- All logs saved to device's Documents directory
- Separate files for debug logs and crash logs:
  - `spyll-debug.log` - General debug logs
  - `spyll-crashes.log` - Dedicated crash reports
- Logs persist across app restarts
- Automatic log rotation to prevent excessive storage use

### 3. **Rich Crash Metadata**
Each crash report includes:
- Error message and type
- Full stack trace
- Source file, line, and column numbers
- User agent and device info
- App version
- Timestamp
- Current URL/route
- Device model and OS version

### 4. **User-Accessible Interface**
- Debug logs page accessible from Settings
- View crash logs and debug logs separately
- Real-time crash count indicator
- Share logs via native share sheet
- Clear individual or all logs

## Implementation Details

### Files Added/Modified

1. **`/utils/mobileLogger.js`** (Enhanced)
   - Added `CRASH_LOG_FILENAME` constant
   - New methods: `logCrash()`, `getCrashLogs()`, `clearCrashLogs()`, `getAllLogs()`, `getCrashCount()`
   - Enhanced crash metadata collection
   - Separate crash log file management

2. **`/components/utils/ErrorBoundary.js`** (New)
   - React Error Boundary component
   - Catches component rendering errors
   - Graceful error UI fallback
   - Automatic crash logging

3. **`/pages/debug-logs/index.js`** (New)
   - Full-featured debug interface
   - Tabbed view for crashes vs debug logs
   - Crash count badge
   - Share and clear functionality

4. **`/pages/_app.js`** (Modified)
   - Wrapped app in ErrorBoundary
   - Ensures all React errors are caught

5. **`/pages/settings/index.js`** (Modified)
   - Added "Debug Logs & Crash Reports" button (native only)
   - Direct access to crash logs from settings

6. **`/package.json`** (Modified)
   - Added `@capacitor/device` dependency for device info

## Usage

### For Developers

#### Install Dependencies
```bash
cd mym
npm install
```

#### Access Logs in Development
1. Open the app on a physical device or emulator
2. Go to Settings
3. Click "Debug Logs & Crash Reports"
4. View crashes or debug logs

#### Share Logs
- Use the "Share" button to export logs
- Send via email, messaging, or save to files

### For Users

Crash logs are automatically captured in the background. Users can:
1. Go to Settings → Debug Logs & Crash Reports
2. See if any crashes occurred
3. Share logs with support team if requested

## Log File Locations

On device (Capacitor):
- **Android**: `Documents/spyll-debug.log` and `Documents/spyll-crashes.log`
- **iOS**: App's Documents directory

## Log Management

### Automatic Limits
- Debug logs: 500KB max, keeps last 5000 lines
- Crash logs: 1MB max, keeps last 50 crashes
- Older entries automatically trimmed

### Manual Management
Users can:
- Clear crash logs only
- Clear all logs
- Refresh to reload from disk

## Testing Crash Logging

### Test Uncaught Error
```javascript
// Add to any page temporarily
setTimeout(() => {
  throw new Error('Test crash for logging');
}, 2000);
```

### Test React Error
```javascript
// Create a component that throws
function BuggyComponent() {
  throw new Error('React error test');
  return <div>Never rendered</div>;
}
```

### Test Unhandled Promise Rejection
```javascript
Promise.reject(new Error('Unhandled promise test'));
```

## Production Deployment

### Build Commands
```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

### Verification Checklist
- [ ] Mobile logger initializes on app start
- [ ] Error boundary wraps main app
- [ ] Crash logs accessible from settings (native only)
- [ ] Logs persist across app restarts
- [ ] Share functionality works
- [ ] Clear logs works

## Privacy Considerations

- Logs stored locally on device only
- No automatic upload to servers
- User controls when to share
- Can clear logs anytime
- Device-specific identifiers included (for multi-device debugging)

## Future Enhancements

Potential additions:
- [ ] Automatic crash reporting to backend
- [ ] Symbolication for minified production builds
- [ ] Performance metrics logging
- [ ] Network request logging
- [ ] User action breadcrumbs
- [ ] Session replay capabilities

## Support

If crash logs aren't being captured:
1. Check console for logger initialization errors
2. Verify Capacitor native platform detection
3. Check filesystem permissions (should be automatic)
4. Ensure app has write access to Documents directory

## Example Crash Log Entry

```
================================================================================
CRASH REPORT - 2026-01-14T18:30:45.123Z
================================================================================
Type: ERROR
Message: Cannot read property 'map' of undefined
Source: pages/confessions.js:145:23
URL: https://spyll.in/confessions
User Agent: Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36...

Stack Trace:
TypeError: Cannot read property 'map' of undefined
    at ConfessionsPage (pages/confessions.js:145:23)
    at renderWithHooks (react-dom.production.min.js:12:345)
    ...
================================================================================
```

## Monitoring

Check crash frequency:
- Open debug logs
- Check crash count badge on "Crash Logs" tab
- Review crash logs for patterns
- Look for common stack traces

## Best Practices

1. **Always test after updates** - Deploy to test devices and verify crash logging
2. **Regular log reviews** - Check beta testers' crash logs periodically
3. **Keep logs cleared** - Encourage users to share then clear old logs
4. **Update app version** - Increment version in package.json to track which build crashed
5. **Test on real devices** - Emulators may not capture all native errors

---

**Implementation Date**: January 14, 2026
**Status**: ✅ Production Ready
**Platforms**: Android, iOS (via Capacitor)
