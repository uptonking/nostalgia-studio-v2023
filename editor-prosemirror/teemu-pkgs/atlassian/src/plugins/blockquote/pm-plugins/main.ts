import { type EditorState, Plugin, PluginKey } from 'prosemirror-state';

import { blockQuoteNodeView } from '../nodeviews/BlockQuoteView';
import { type CommandDispatch } from '../../../types';
import { findBlockQuote } from '../pm-utils/findBlockQuote';

import { type PortalProviderAPI } from '../../../react-portals';
import {
  type EventDispatcher,
  type Dispatch,
} from '../../../utils/event-dispatcher';

import { type BlockQuoteOptions } from '../';

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
