import * as React from 'react';

import { css } from '@linaria/core';

import { themed } from '../../../src';

export const errorFallbackCss = css`
  /* color: ${themed.color.text.error}; */
  color: #f00;
`;

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};
type ErrorBoundaryState = { hasError: boolean };

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  fallback: React.ReactNode;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.fallback = this.props.fallback ?? (
      <h3 className={errorFallbackCss}>ui is not rendering properly.</h3>
    );
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
