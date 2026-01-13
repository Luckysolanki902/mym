// Error Boundary Component - Catches React component errors and logs them
import React from 'react';
import { mobileLogger } from '@/utils/mobileLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  async componentDidCatch(error, errorInfo) {
    // Log the error to mobile logger
    console.error('React Error Boundary caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log crash to device storage
    try {
      await mobileLogger.logCrash({
        type: 'REACT_ERROR',
        message: error?.message || String(error),
        stack: error?.stack || errorInfo?.componentStack || 'No stack trace',
        componentStack: errorInfo?.componentStack || '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
      });
      await mobileLogger.flush();
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>😔</div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#FF5973',
              marginBottom: '1rem',
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              We're sorry for the inconvenience. The error has been logged and we'll look into it.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.href = '/';
              }}
              style={{
                backgroundColor: '#FF5973',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#FF4060'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#FF5973'}
            >
              Go to Home
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#d32f2f',
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
