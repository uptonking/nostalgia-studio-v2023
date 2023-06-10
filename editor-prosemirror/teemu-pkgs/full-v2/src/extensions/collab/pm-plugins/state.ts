import { type EditorState } from 'prosemirror-state';
import { Decoration, type DecorationSet } from 'prosemirror-view';

import { type CommandDispatch, PluginKey } from '../../../core';
import { type CollabParticipant } from '../types';

export interface CollabState {
  decorations: DecorationSet;
  participants: Map<string, CollabParticipant>;
  isCollabInitialized: boolean;
}

export const collabEditPluginKey = new PluginKey('collabEditPlugin');

export const getPluginState = (state: EditorState): CollabState =>
  collabEditPluginKey.getState(state);

export const setPluginState =
  (stateProps: Object) =>
  (state: EditorState, dispatch: CommandDispatch): boolean => {
    const pluginState = getPluginState(state);
    dispatch(
      state.tr.setMeta(collabEditPluginKey, {
        ...pluginState,
        ...stateProps,
      }),
    );
    return true;
  };
