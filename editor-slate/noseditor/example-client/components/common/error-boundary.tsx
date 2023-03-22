import * as React from 'react';

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  fallback: React.ReactNode;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.fallback = this.props.fallback ?? <h3>ui is rendering properly.</h3>;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error);
    // logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.fallback;
    }
    return this.props.children;
  }
}
