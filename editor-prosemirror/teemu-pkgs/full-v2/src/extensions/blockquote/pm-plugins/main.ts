import { Plugin } from 'prosemirror-state';

import { type EditorContext } from '../../../context';
import { blockQuoteNodeView } from '../nodeviews/BlockQuoteView';
import { findBlockQuote } from '../pm-utils/findBlockQuote';
import { type BlockQuoteState, blockquotePluginKey } from './state';
import { type BlockQuoteExtensionProps } from '..';

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
