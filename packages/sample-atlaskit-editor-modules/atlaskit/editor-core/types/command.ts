import type { EditorState, Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type CommandDispatch = (tr: Transaction) => void;

/** type: 一个prosemirror-command方法 */
export type Command = (
  state: EditorState,
  dispatch?: CommandDispatch,
  view?: EditorView,
) => boolean;

export type HigherOrderCommand = (command: Command) => Command;
