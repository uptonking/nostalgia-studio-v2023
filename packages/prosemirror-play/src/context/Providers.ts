import { PortalProvider } from '../react';
import { APIProvider } from './APIProvider';
import { EditorViewProvider } from './EditorViewProvider';
import { ExtensionProvider } from './ExtensionProvider';
import { PluginsProvider } from './PluginsProvider';
import { AnalyticsProvider } from './analytics/AnalyticsProvider';

export interface IProviders {
  analyticsProvider: AnalyticsProvider;
  apiProvider: APIProvider;
  extensionProvider: ExtensionProvider;
  pluginsProvider: PluginsProvider;
  portalProvider: PortalProvider;
  viewProvider: EditorViewProvider;
}

export const createDefaultProviders = (): IProviders => {
  const analyticsProvider = new AnalyticsProvider();
  const apiProvider = new APIProvider();
  const extensionProvider = new ExtensionProvider();
  const pluginsProvider = new PluginsProvider();
  const portalProvider = new PortalProvider();
  const viewProvider = new EditorViewProvider();
  return {
    analyticsProvider,
    apiProvider,
    extensionProvider,
    pluginsProvider,
    portalProvider,
    viewProvider,
  };
};
