import { EditorState, Transaction } from 'prosemirror-state';

// 定义了两个command

export function createNewBlockQuote(
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
) {
  const { $from, $to } = state.selection;
  const blockquote = state.schema.nodes.blockquote;
  const empty = blockquote.createAndFill();
  const endOfBlock = $from.end();
  if (empty && dispatch) {
    const tr = state.tr.insert(endOfBlock + 1, empty);
    dispatch(tr);
  }
  return false;
}

/** New ProseMirror-managed blockquote，与上面几乎相同，只是创建的PMNode类型不同 */
export function createNewPmBlockQuote(
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
) {
  const { $from, $to } = state.selection;
  const blockquote = state.schema.nodes.pmBlockquote;
  const empty = blockquote.createAndFill();
  const endOfBlock = $from.end();
  if (empty && dispatch) {
    const tr = state.tr.insert(endOfBlock + 1, empty);
    dispatch(tr);
  }
  return false;
}
