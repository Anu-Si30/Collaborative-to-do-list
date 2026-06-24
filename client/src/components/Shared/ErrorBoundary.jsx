import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          background: '#111',
          color: '#fff',
          fontFamily: 'monospace',
          minHeight: '100vh',
        }}>
          <h2 style={{ color: '#ff4d4d' }}>⚠️ App crashed — Error Details:</h2>
          <pre style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            color: '#ff8c8c',
            overflowX: 'auto',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.info?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
