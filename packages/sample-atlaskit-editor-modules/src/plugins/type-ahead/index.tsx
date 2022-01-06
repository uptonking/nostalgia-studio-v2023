import React from 'react';

import { typeAheadQuery } from '../../schema/marks';
import type { EditorPlugin } from '../../types';
import WithPluginState from '../../ui/hocs/WithPluginState';
import { inputRulePlugin } from './pm-plugins/input-rules';
import { keymapPlugin } from './pm-plugins/keymap';
import {
  PluginState as TypeAheadPluginState,
  createInitialPluginState,
  createPlugin,
  pluginKey as typeAheadPluginKey,
} from './pm-plugins/main';
import { TypeAheadHandler } from './types';
import { TypeAhead } from './ui/TypeAhead';

/** 创建了3个prosemirror plugins */
export const typeAheadPlugin = (): EditorPlugin => ({
  name: 'typeAhead',

  /** slash后面输入的文字对应的schema */
  marks() {
    return [{ name: 'typeAheadQuery', mark: typeAheadQuery }];
  },

  /** 本插件的pluginOptions参数定义在quickInsertPlugin */
  pmPlugins(typeAhead: Array<TypeAheadHandler> = []) {
    return [
      {
        name: 'typeAhead',
        plugin: ({ dispatch }) => createPlugin(dispatch, typeAhead),
      },
      {
        name: 'typeAheadInputRule',
        plugin: ({ schema }) => inputRulePlugin(schema, typeAhead),
      },
      {
        name: 'typeAheadKeymap',
        plugin: () => keymapPlugin(),
      },
    ];
  },

  /** 渲染slash弹出菜单对应的react组件，在react tree中的位置要查看FullPage组件 */
  contentComponent({
    editorView,
    popupsMountPoint,
    popupsBoundariesElement,
    popupsScrollableElement,
  }) {
    return (
      <WithPluginState
        plugins={{
          typeAhead: typeAheadPluginKey,
        }}
        render={({
          typeAhead = createInitialPluginState(),
        }: {
          typeAhead: TypeAheadPluginState;
        }) => {
          if (
            typeAhead.typeAheadHandler &&
            typeAhead.typeAheadHandler.headless
          ) {
            return null;
          }

          const { queryMarkPos } = typeAhead;
          let domRef = null;
          if (queryMarkPos !== null) {
            // temporary fix to avoid page crash until it is fixed properly
            try {
              // 获取到dom元素对象
              domRef = editorView.domAtPos(queryMarkPos);
            } catch (ex) {
              return null;
            }
          }

          const anchorElement = domRef
            ? ((domRef.node as HTMLElement).childNodes[
                domRef.offset
              ] as HTMLElement)
            : undefined;

          return (
            <TypeAhead
              editorView={editorView}
              popupsMountPoint={popupsMountPoint}
              popupsBoundariesElement={popupsBoundariesElement}
              popupsScrollableElement={popupsScrollableElement}
              anchorElement={anchorElement}
              active={typeAhead.active}
              isLoading={!!typeAhead.itemsLoader}
              items={typeAhead.items}
              currentIndex={typeAhead.currentIndex}
              highlight={typeAhead.highlight}
            />
          );
        }}
      />
    );
  },
});

export { typeAheadPluginKey };
export type { TypeAheadPluginState };
