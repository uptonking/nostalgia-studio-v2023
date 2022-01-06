import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import { ProviderFactory } from '../provider-factory';
import { PortalProviderAPI } from '../react-portals/PortalProviderAPI';
import { Dispatch, EventDispatcher } from '../utils/event-dispatcher';
// TODO: Check if this circular dependency is still needed or is just legacy
import { EditorConfig } from './editor-config';

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
