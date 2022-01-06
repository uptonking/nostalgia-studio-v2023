import type { InjectedIntl } from 'react-intl';

// import type { UIAnalyticsEventHandler } from '@atlaskit/analytics-next';

type UIAnalyticsEventHandler = any;

/** type: 传递分析事件和多语言的context */
export type EditorReactContext = {
  getAtlaskitAnalyticsEventHandlers: () => UIAnalyticsEventHandler[];
  intl: InjectedIntl;
};
