import type { Schema } from 'prosemirror-model';
import type { Plugin } from 'prosemirror-state';

import type { ErrorReporter, ProviderFactory } from '../../editor-common';
import type { Dispatch, EventDispatcher } from '../event-dispatcher';
import type { DispatchAnalyticsEvent } from '../plugins/analytics/types/dispatch-analytics-event';
import type { EditorReactContext } from '../types';
import type { PortalProviderAPI } from '../ui/PortalProvider';
import type { FeatureFlags } from './feature-flags';

export type PMPluginFactoryParams = {
  schema: Schema;
  dispatch: Dispatch;
  eventDispatcher: EventDispatcher;
  providerFactory: ProviderFactory;
  errorReporter?: ErrorReporter;
  portalProviderAPI: PortalProviderAPI;
  reactContext: () => EditorReactContext;
  dispatchAnalyticsEvent: DispatchAnalyticsEvent;
  featureFlags: FeatureFlags;
};

/** 创建并返回prosemirror-Plugin对象的工厂方法 */
export type PMPluginFactory = (
  params: PMPluginFactoryParams,
) => Plugin | undefined;

/** 插件名，及其对应的创建prosemirror-Plugin对象的工厂方法 */
export type PMPlugin = {
  name: string;
  plugin: PMPluginFactory;
};
