import * as React from 'react';

export class RoutingPagesErrorBoundary extends React.Component<{}, any> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log('// ---------- DynamicImportErrorBoundary --------- // ');
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1 style={{ color: 'red' }}>Something went wrong.</h1>;
          <p>you can check the console to see the error message details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RoutingPagesErrorBoundary;
