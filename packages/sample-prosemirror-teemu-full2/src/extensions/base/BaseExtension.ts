import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';

import { Extension, IExtensionSchema } from '../Extension';
import { em, strong } from './marks';
import { doc, paragraph, text } from './nodes';
import { basePluginFactory } from './pm-plugins/main';
import { BaseState, basePluginKey, getPluginState } from './pm-plugins/state';

export interface BaseExtensionProps {}

export const baseSchema: IExtensionSchema = {
  nodes: { doc, paragraph, text },
  marks: { em, strong },
};

/** 定义了文本编辑器最基本的schema/plugins/keys/undo-redo， 主要是doc/text/p/strong/em */
export class BaseExtension extends Extension<BaseExtensionProps> {
  get name() {
    return 'base';
  }

  get schema() {
    return baseSchema;
  }

  static get pluginKey() {
    return basePluginKey;
  }

  static getPluginState(state: EditorState) {
    return getPluginState(state);
  }

  subscribe(fn: (newState: BaseState) => void) {
    this.ctx.pluginsProvider.subscribe(basePluginKey, fn);
  }

  unsubscribe(fn: (newState: BaseState) => void) {
    this.ctx.pluginsProvider.unsubscribe(basePluginKey, fn);
  }

  get plugins() {
    return [
      { name: 'history', plugin: () => history() },
      { name: 'baseKeyMap', plugin: () => keymap(baseKeymap) },
      { name: 'base', plugin: () => basePluginFactory(this.ctx, this.props) },
    ];
  }
}
