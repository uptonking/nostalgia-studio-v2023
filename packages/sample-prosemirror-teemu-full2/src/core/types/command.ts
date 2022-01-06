import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export type CommandDispatch = (tr: Transaction) => void;

/** 符合prosemirror规范的command方法，commands don't have to dispatch a transaction */
export type Command = (
  state: EditorState,
  dispatch?: CommandDispatch,
  view?: EditorView,
) => boolean;

export type HigherOrderCommand = (command: Command) => Command;
