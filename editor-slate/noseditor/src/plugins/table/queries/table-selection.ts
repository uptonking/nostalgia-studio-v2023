import { Editor, Element } from 'slate';

export const isSelectionInTable = (editor: Editor) => {
  if (!editor.selection || editor.children.length === 0) {
    return false;
  }

  const [tableNode] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === 'table',
    mode: 'highest',
  });
  return Boolean(tableNode);
};
