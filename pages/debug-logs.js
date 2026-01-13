// Debug page - View app logs on device
// Access at: /debug-logs

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { Capacitor } from '@capacitor/core';

export default function DebugLogsPage() {
  const [logs, setLogs] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      setIsNative(Capacitor.isNativePlatform());
      
      if (!Capacitor.isNativePlatform()) {
        setLogs('Debug logs are only available in the native app.');
        setLoading(false);
        return;
      }

      try {
        const { mobileLogger } = await import('@/utils/mobileLogger');
        const logContent = await mobileLogger.getLogs();
        setLogs(logContent || 'No logs found');
      } catch (e) {
        setLogs(`Error loading logs: ${e.message}`);
      }
      setLoading(false);
    };

    loadLogs();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { mobileLogger } = await import('@/utils/mobileLogger');
      await mobileLogger.flush();
      const logContent = await mobileLogger.getLogs();
      setLogs(logContent || 'No logs found');
    } catch (e) {
      setLogs(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleClear = async () => {
    try {
      const { mobileLogger } = await import('@/utils/mobileLogger');
      await mobileLogger.clearLogs();
      setLogs('Logs cleared');
    } catch (e) {
      setLogs(`Error: ${e.message}`);
    }
  };

  const handleShare = async () => {
    try {
      const { mobileLogger } = await import('@/utils/mobileLogger');
      await mobileLogger.shareLogs();
    } catch (e) {
      alert(`Error sharing: ${e.message}`);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      alert('Logs copied to clipboard!');
    } catch (e) {
      alert(`Error copying: ${e.message}`);
    }
  };

  return (
    <Box sx={{ p: 2, minHeight: '100vh', bgcolor: '#121212' }}>
      <Typography variant="h5" sx={{ color: '#FF5973', mb: 2, fontWeight: 600 }}>
        🔧 Debug Logs
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          disabled={loading}
          size="small"
          sx={{ bgcolor: '#FF5973' }}
        >
          Refresh
        </Button>
        {isNative && (
          <>
            <Button 
              variant="outlined" 
              onClick={handleShare}
              size="small"
              sx={{ borderColor: '#FF5973', color: '#FF5973' }}
            >
              Share
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              size="small"
              color="warning"
            >
              Clear
            </Button>
          </>
        )}
        <Button 
          variant="outlined" 
          onClick={handleCopy}
          size="small"
          sx={{ borderColor: '#888', color: '#888' }}
        >
          Copy
        </Button>
      </Box>

      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: '#1a1a1a', 
          borderRadius: 2,
          maxHeight: '70vh',
          overflow: 'auto'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#FF5973' }} />
          </Box>
        ) : (
          <Typography 
            component="pre" 
            sx={{ 
              color: '#ccc', 
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              m: 0
            }}
          >
            {logs}
          </Typography>
        )}
      </Paper>

      <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
        Log file location: Documents/spyll-debug.log
      </Typography>
    </Box>
  );
}
