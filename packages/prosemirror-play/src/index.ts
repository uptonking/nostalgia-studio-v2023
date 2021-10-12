export {
  useEditorContext,
  createDefaultProviders,
  ReactEditorContext,
  EditorViewProvider,
  PluginsProvider,
  AnalyticsProvider,
  APIProvider,
} from './context';
export type { EditorContext, IProviders } from './context';

export { Editor } from './core';

export {
  Base,
  BaseExtension,
  BlockQuote,
  BlockQuoteExtension,
  Extension,
  createSchema,
  createDefaultSchema,
  createPlugins,
} from './extensions';
export type { BaseState, BlockQuoteState } from './extensions';

export { PortalRenderer } from './react';

export { Editor as default } from './core';
