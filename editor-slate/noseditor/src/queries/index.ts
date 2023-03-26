import { Editor, Element, Node } from 'slate';

export const isEmptyNode = (node: Node) => {
  const result = node && Node.string(node) === '';
  return result;
};

export const isBlockActive = (editor: Editor, type) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
  });

  return !!match;
};

export function findSelectionAnchorElement(editor: Editor) {
  if (editor.selection?.anchor) {
    const pathClone = [...editor.selection.anchor.path];
    // get rid of trailing text node postion in path.
    pathClone.pop();
    const anchorNode = pathClone.reduce((node: Element, pathPosition) => {
      if (!node) return editor.children[pathPosition];
      return node.children[pathPosition];
    }, null);
    return anchorNode;
  }

  return null;
}
