// Debug Logs Page - View and share app logs and crash reports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { mobileLogger } from '@/utils/mobileLogger';
import { Capacitor } from '@capacitor/core';
import styles from '../settings/settings.module.css';

export default function DebugLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState({ debugLogs: '', crashLogs: '', combined: '' });
  const [activeTab, setActiveTab] = useState('crashes');
  const [loading, setLoading] = useState(true);
  const [crashCount, setCrashCount] = useState(0);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    
    if (!native) {
      setLoading(false);
      return;
    }

    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const allLogs = await mobileLogger.getAllLogs();
      setLogs(allLogs);
      
      const count = await mobileLogger.getCrashCount();
      setCrashCount(count);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await mobileLogger.shareAllLogs();
    } catch (e) {
      alert('Failed to share logs');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    
    try {
      await mobileLogger.clearLogs();
      await mobileLogger.clearCrashLogs();
      await loadLogs();
      alert('All logs cleared');
    } catch (e) {
      alert('Failed to clear logs');
    }
  };

  const handleClearCrashes = async () => {
    if (!confirm('Are you sure you want to clear crash logs?')) return;
    
    try {
      await mobileLogger.clearCrashLogs();
      await loadLogs();
      alert('Crash logs cleared');
    } catch (e) {
      alert('Failed to clear crash logs');
    }
  };

  if (!isNative) {
    return (
      <div className={styles.settingscontainer}>
        <div className={styles.topbar}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← Back
          </button>
          <h1 className={styles.heading}>Debug Logs</h1>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Debug logs are only available on mobile apps.</p>
          <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Use the app on Android or iOS to access crash reports and debug logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingscontainer}>
      <div className={styles.topbar}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.heading}>Debug Logs</h1>
        <button 
          onClick={handleShare}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#FF5973',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Share
        </button>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px',
          color: '#666',
        }}>
          Loading logs...
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white',
          }}>
            <button
              onClick={() => setActiveTab('crashes')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === 'crashes' ? '#FF5973' : 'transparent',
                color: activeTab === 'crashes' ? 'white' : '#666',
                border: activeTab === 'crashes' ? 'none' : '1px solid #e0e0e0',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              Crash Logs
              {crashCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}>
                  {crashCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: activeTab === 'debug' ? '#FF5973' : 'transparent',
                color: activeTab === 'debug' ? 'white' : '#666',
                border: activeTab === 'debug' ? 'none' : '1px solid #e0e0e0',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Debug Logs
            </button>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <button
              onClick={loadLogs}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4FC3F7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh
            </button>
            {activeTab === 'crashes' && crashCount > 0 && (
              <button
                onClick={handleClearCrashes}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Clear Crashes
              </button>
            )}
            <button
              onClick={handleClearAll}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          </div>

          {/* Log Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
          }}>
            <pre style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              lineHeight: '1.5',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: "'Courier New', monospace",
              minHeight: '400px',
            }}>
              {activeTab === 'crashes' ? (
                logs.crashLogs === 'No crash logs found' ? (
                  <div style={{ textAlign: 'center', color: '#4caf50', padding: '2rem' }}>
                    ✓ No crashes recorded!
                    <br />
                    <span style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem', display: 'block' }}>
                      Your app is running smoothly.
                    </span>
                  </div>
                ) : (
                  logs.crashLogs
                )
              ) : (
                logs.debugLogs === 'No logs found' ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                    No debug logs available
                  </div>
                ) : (
                  logs.debugLogs
                )
              )}
            </pre>
          </div>

          {/* Info Banner */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderTop: '1px solid #90caf9',
            color: '#1976d2',
            fontSize: '0.75rem',
            lineHeight: '1.4',
          }}>
            <strong>ℹ️ About Logs:</strong>
            <br />
            • Crash logs are automatically saved when errors occur
            <br />
            • Debug logs capture console output and app events
            <br />
            • Use "Share" to send logs for debugging
            <br />
            • Logs are stored locally on your device
          </div>
        </>
      )}
    </div>
  );
}
