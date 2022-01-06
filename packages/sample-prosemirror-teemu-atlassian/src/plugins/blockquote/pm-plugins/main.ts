import { EditorState, Plugin, PluginKey } from 'prosemirror-state';

import { PortalProviderAPI } from '../../../react-portals';
import { CommandDispatch } from '../../../types';
import { Dispatch, EventDispatcher } from '../../../utils/event-dispatcher';
import { BlockQuoteOptions } from '../';
import { blockQuoteNodeView } from '../nodeviews/BlockQuoteView';
import { findBlockQuote } from '../pm-utils/findBlockQuote';

export interface BlockQuoteState {
  blockQuoteActive: boolean;
  // blockQuoteDisabled: boolean
}

export const blockquotePluginKey = new PluginKey('blockQuotePlugin');

export const getPluginState = (state: EditorState): BlockQuoteState =>
  blockquotePluginKey.getState(state);

export const setPluginState =
  (stateProps: Object) =>
  (state: EditorState, dispatch: CommandDispatch): boolean => {
    const pluginState = getPluginState(state);
    dispatch(
      state.tr.setMeta(blockquotePluginKey, {
        ...pluginState,
        ...stateProps,
      }),
    );
    return true;
  };

// export type CodeBlockStateSubscriber = (state: BlockQuoteState) => any;

export function blockQuotePluginFactory(
  dispatch: Dispatch,
  // providerFactory: ProviderFactory,
  portalProviderAPI: PortalProviderAPI,
  eventDispatcher: EventDispatcher,
  options?: BlockQuoteOptions,
) {
  return new Plugin({
    state: {
      init(_, state): BlockQuoteState {
        console.log(';;plugin-blockquote-state-creating');

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
        console.log(';;plugin-blockquote-state.apply()');

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
            dispatch(blockquotePluginKey, nextPluginState);
            return nextPluginState;
          }
        }

        return pluginState;
      },
    },
    key: blockquotePluginKey,
    props: {
      nodeViews: {
        blockquote: blockQuoteNodeView(
          portalProviderAPI,
          eventDispatcher,
          options,
        ),
      },
    },
  });
}
