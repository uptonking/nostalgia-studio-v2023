import { Plugin } from 'prosemirror-state';

import { EditorContext } from '../../../context';
import { blockQuoteNodeView } from '../nodeviews/BlockQuoteView';
import { findBlockQuote } from '../pm-utils/findBlockQuote';
import { BlockQuoteState, blockquotePluginKey } from './state';
import { BlockQuoteExtensionProps } from '..';

/** 创建并返回一个prosemirror Plugin，注意Plugin的props中保存了该插件的nodeViews */
export function blockQuotePluginFactory(
  ctx: EditorContext,
  props: BlockQuoteExtensionProps,
) {
  const { pluginsProvider } = ctx;
  return new Plugin({
    state: {
      init(_, state): BlockQuoteState {
        return {
          blockQuoteActive: false,
          // blockQuoteDisabled: false,
        };
      },
      apply(
        tr,
        pluginState: BlockQuoteState,
        _oldState,
        newState,
      ): BlockQuoteState {
        if (tr.docChanged || tr.selectionSet) {
          const blockQuoteActive = !!findBlockQuote(
            newState,
            newState.selection,
          );
          // const blockQuoteDisabled = !(
          //   blockQuoteActive ||
          //   isWrappingPossible(newState.schema.blockquote, newState)
          // )

          if (blockQuoteActive !== pluginState.blockQuoteActive) {
            const nextPluginState = {
              ...pluginState,
              blockQuoteActive,
              // blockQuoteDisabled,
            };

            // 执行这个插件所有callback
            pluginsProvider.publish(blockquotePluginKey, nextPluginState);
            return nextPluginState;
          }
        }

        return pluginState;
      },
    },
    key: blockquotePluginKey,
    props: {
      nodeViews: {
        blockquote: blockQuoteNodeView(ctx, props),
      },
    },
  });
}
