import { type Plugin } from 'prosemirror-state';
import { type Schema } from 'prosemirror-model';

// TODO: Check if this circular dependency is still needed or is just legacy
// eslint-disable-next-line import/no-cycle
import { type EditorConfig } from './editor-config';
import { type Dispatch, type EventDispatcher } from '../utils/event-dispatcher';
import { type PortalProviderAPI } from '../react-portals/PortalProviderAPI';
import { type ProviderFactory } from '../provider-factory';

export type PMPluginFactoryParams = {
  schema: Schema;
  dispatch: Dispatch;
  eventDispatcher: EventDispatcher;
  providerFactory: ProviderFactory;
  portalProviderAPI: PortalProviderAPI;
};

export type PMPluginCreateConfig = PMPluginFactoryParams & {
  editorConfig: EditorConfig;
};

export type PMPluginFactory = (
  params: PMPluginFactoryParams,
) => Plugin | undefined;

export type PMPlugin = {
  name: string;
  plugin: PMPluginFactory;
};
