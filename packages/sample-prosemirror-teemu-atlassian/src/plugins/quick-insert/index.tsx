import { Plugin } from 'prosemirror-state';
import React from 'react';

import {
  ProviderFactory,
  QuickInsertItem,
  QuickInsertProvider,
} from '../../provider-factory';
import type { Command, EditorPlugin } from '../../types';
import type { Dispatch } from '../../utils/event-dispatcher';
import { pluginKey } from './plugin-key';
import { searchQuickInsertItems } from './search';
import {
  QuickInsertHandler,
  QuickInsertPluginOptions,
  QuickInsertPluginState,
} from './types';

// import ModalElementBrowser from './ui/ModalElementBrowser';

export type {
  QuickInsertHandler,
  QuickInsertPluginState,
  QuickInsertPluginOptions,
};

export { pluginKey };

/** 实现了创建菜单项的流程 */
export const quickInsertPlugin = (
  options?: QuickInsertPluginOptions,
): EditorPlugin => ({
  name: 'quickInsert',

  pmPlugins(quickInsert: Array<QuickInsertHandler>) {
    return [
      {
        name: 'quickInsert', // It's important that this plugin is above TypeAheadPlugin
        plugin: ({ providerFactory, dispatch }) =>
          quickInsertPluginFactory(quickInsert, providerFactory, dispatch),
      },
    ];
  },

  pluginsOptions: {
    typeAhead: {
      trigger: '/',
      headless: options ? options.headless : undefined,
      getItems: (query, state, _tr, dispatch) => {
        const quickInsertState: QuickInsertPluginState =
          pluginKey.getState(state);
        return searchQuickInsertItems(quickInsertState, options)(query);
      },
      selectItem: (state, item, insert) => {
        return (item as QuickInsertItem).action(insert, state);
      },
    },
  },

  // contentComponent({ editorView }) {
  //   if (options && options.enableElementBrowser) {
  //     return <ModalElementBrowser editorView={editorView} />;
  //   }

  //   return null;
  // },
});

/** 缓存slash弹出菜单项的映射表 */
const itemsCache: Record<string, Array<QuickInsertItem>> = {};

/** 设置en配置到缓存 */
export const processItems = (items: Array<QuickInsertHandler>) => {
  if (!itemsCache['en']) {
    itemsCache['en'] = items.reduce(
      (acc: Array<QuickInsertItem>, item: QuickInsertHandler) => {
        // if (typeof item === 'function') {
        //   return acc.concat(item('en'));
        // }
        return acc.concat(item);
      },
      [],
    );
  }
  return itemsCache['en'];
};

/** 创建command函数的工厂方法，会更新plugin state */
const setProviderState =
  (providerState: Partial<QuickInsertPluginState>): Command =>
  (state, dispatch) => {
    if (dispatch) {
      dispatch(state.tr.setMeta(pluginKey, providerState));
    }
    return true;
  };

/** 创建一个prosemirror-plugin  */
function quickInsertPluginFactory(
  quickInsertItems: Array<QuickInsertHandler>,
  providerFactory: ProviderFactory,
  dispatch: Dispatch,
) {
  return new Plugin({
    key: pluginKey,
    state: {
      init(): QuickInsertPluginState {
        console.log(';;plugin-quickInsert-state-creating');

        return {
          isElementBrowserModalOpen: false,
          // lazy so it doesn't run on editor initialization
          lazyDefaultItems: () => processItems(quickInsertItems || []),
        };
      },

      apply(tr, pluginState) {
        console.log(';;plugin-quickInsert-state.apply()');

        const meta = tr.getMeta(pluginKey);
        if (meta) {
          const changed = Object.keys(meta).some((key) => {
            return pluginState[key] !== meta[key];
          });

          if (changed) {
            const newState = { ...pluginState, ...meta };

            dispatch(pluginKey, newState);
            return newState;
          }
        }

        return pluginState;
      },
    },

    view(editorView) {
      console.log(';;plugin-quickInsert-view()');

      const providerHandler = async (
        _name: string,
        providerPromise?: Promise<QuickInsertProvider>,
      ) => {
        if (providerPromise) {
          try {
            const provider = await providerPromise;
            // 获取预定义的slash菜单项
            const providedItems = await provider.getItems();

            // 通过dispatch更新plugin state
            setProviderState({ provider, providedItems })(
              editorView.state,
              editorView.dispatch,
            );
          } catch (e) {
            console.error('Error getting items from quick insert provider', e);
          }
        }
      };

      // quickInsertProvider是在顶层Editor组件中注册的
      providerFactory.subscribe('quickInsertProvider', providerHandler);

      return {
        /** Called when the view is destroyed or receives a state with different plugins. */
        destroy() {
          providerFactory.unsubscribe('quickInsertProvider', providerHandler);
        },
      };
    },
  });
}
