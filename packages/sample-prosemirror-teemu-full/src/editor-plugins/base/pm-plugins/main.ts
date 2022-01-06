import { EditorState, Plugin } from 'prosemirror-state';

import { PluginsProvider } from '../../../core';
import { PluginKey } from '../../../core/pm';
import { CommandDispatch } from '../../../core/types';
import { PortalProvider } from '../../../react/portals';
import { getActiveMarks } from '../pm-utils/getActive';

export interface BaseState {
  activeNodes: string[];
  activeMarks: string[];
}

export const basePluginKey = new PluginKey('basePlugin');

export const getPluginState = (state: EditorState): BaseState =>
  basePluginKey.getState(state);

/** 一个高阶函数，可以创建setMeta设置元数据的pm-command */
export const setPluginState =
  (stateProps: Object) =>
  (state: EditorState, dispatch: CommandDispatch): boolean => {
    const pluginState = getPluginState(state);
    dispatch(
      state.tr.setMeta(basePluginKey, {
        ...pluginState,
        ...stateProps,
      }),
    );
    return true;
  };

/** 创建基本的pm-Plugin，存放activeNodes、activeMarks作为state */
export function basePluginFactory(
  portalProvider: PortalProvider,
  pluginsProvider: PluginsProvider,
  options?: {},
) {
  return new Plugin({
    state: {
      init(_, state): BaseState {
        return {
          activeNodes: [],
          activeMarks: [],
        };
      },
      apply(tr, pluginState: BaseState, _oldState, newState): BaseState {
        if (tr.docChanged || tr.selectionSet) {
          const marks = getActiveMarks(newState);
          const eqMarks =
            marks.every((m) => pluginState.activeMarks.includes(m)) &&
            marks.length === pluginState.activeMarks.length;
          if (!eqMarks) {
            const nextPluginState = {
              ...pluginState,
              activeMarks: marks,
            };
            // 执行插件中注册的所有cb
            pluginsProvider.publish(basePluginKey, nextPluginState);
            return nextPluginState;
          }
        }

        return pluginState;
      },
    },
    key: basePluginKey,
    props: {},
  });
}
