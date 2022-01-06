import * as React from 'react';

import { ACTION, EVENT_TYPE, ErrorEventPayload } from '../../plugins/analytics';
import type { DispatchAnalyticsEvent } from '../../plugins/analytics/types';

type ErrorCrashPayload = Extract<
  ErrorEventPayload,
  { action: ACTION.EDITOR_CRASHED }
>;

interface ErrorBoundaryProps {
  component: ErrorCrashPayload['actionSubject'];
  componentId?: ErrorCrashPayload['actionSubjectId'];
  dispatchAnalyticsEvent?: DispatchAnalyticsEvent;
  fallbackComponent?: React.ReactNode;
}

interface ErrorBoundaryState {
  errorCaptured: boolean;
}

/**
 * 在componentDidCatch中捕获异常，并显示到props.fallbackComponent
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { errorCaptured: false };

  hasFallback() {
    return typeof this.props.fallbackComponent !== 'undefined';
  }

  shouldRecover() {
    return this.hasFallback() && this.state.errorCaptured;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.dispatchAnalyticsEvent) {
      // this.props.dispatchAnalyticsEvent({
      //   action: ACTION.EDITOR_CRASHED,
      //   actionSubject: this.props.component,
      //   actionSubjectId: this.props.componentId,
      //   eventType: EVENT_TYPE.OPERATIONAL,
      //   attributes: {
      //     error,
      //     errorInfo,
      //     errorRethrown: !this.hasFallback(),
      //   },
      // });
    }

    if (this.hasFallback()) {
      this.setState({ errorCaptured: true });
    }
  }

  render() {
    if (this.shouldRecover()) {
      return this.props.fallbackComponent;
    }
    return this.props.children;
  }
}
