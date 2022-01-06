import PropTypes from 'prop-types';
import React from 'react';

import { Context as CardContext } from '../../components/smart-card';
import type { CardContext as CardContextType } from '../../components/smart-card';

// import {
//   default as AnalyticsReactContext,
//   AnalyticsReactContextInterface,
// } from '@atlaskit/analytics-next-stable-react-context';

export type ContextAdaptersMap = Record<string, React.Context<any>>;

function useContextMemoized<T>(reactContext: React.Context<T>) {
  const value = React.useContext(reactContext);
  const context = React.useMemo(
    () => ({
      Provider: reactContext.Provider,
      Consumer: reactContext.Consumer,
      value,
    }),
    [value, reactContext],
  );
  return context;
}

/**
 * injects contexts via old context API to children
 * and gives access to the original Provider so that
 * the child can re-emit it.
 * todo: 去掉legacy context。
 */
export const ContextAdapter: React.FunctionComponent = ({ children }) => {
  const card = useContextMemoized(CardContext);
  // const analytics = useContextMemoized(AnalyticsReactContext);
  const analytics = undefined;
  return (
    <LegacyContextAdapter card={card} analytics={analytics}>
      {children}
    </LegacyContextAdapter>
  );
};

type ContextWrapper<T> = {
  Provider: React.Provider<T>;
  Consumer: React.Consumer<T>;
  value: T;
};

type LegacyContextAdapterProps = {
  card?: ContextWrapper<CardContextType | undefined>;
  analytics?: ContextWrapper<any>;
};

/** 简单地通过getChildContext定义要传递的数据 contextAdapter */
class LegacyContextAdapter extends React.PureComponent<
  LegacyContextAdapterProps,
  {}
> {
  static childContextTypes = {
    contextAdapter: PropTypes.object,
  };

  // todo, remove it
  contextState: LegacyContextAdapterProps = {};

  getChildContext() {
    return {
      contextAdapter: {
        card: this.props.card,
        analytics: this.props.analytics,
      },
    };
  }

  render() {
    return this.props.children;
  }
}
