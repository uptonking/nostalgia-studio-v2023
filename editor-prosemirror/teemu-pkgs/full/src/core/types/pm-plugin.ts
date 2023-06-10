import { type Plugin } from 'prosemirror-state';
import { type Schema } from 'prosemirror-model';

import { type EditorConfig } from './editor-config';
import { type EditorContext } from '../EditorContext';

export type PMPluginFactoryParams = {
  schema: Schema;
  ctx: EditorContext;
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
