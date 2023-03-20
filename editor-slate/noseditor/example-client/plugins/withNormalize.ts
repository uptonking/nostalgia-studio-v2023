import { Editor, Transforms } from 'slate';

/**
 * - When collaborating with other users the asynchronous nature of applying changes can result in a state where slate has no children.
 * - Rendering this state will result in a crash.
 * - To avoid the issue we have to add a normalization rule to ensure the slate state is always valid.
 */
export function withEnsureOneChildren(editor: Editor) {
  const { normalizeNode } = editor;

  // Ensure editor always has at least one child.
  editor.normalizeNode = (entry) => {
    const [node] = entry;
    if (!Editor.isEditor(node) || node.children.length > 0) {
      return normalizeNode(entry);
    }

    Transforms.insertNodes(
      editor,
      {
        type: 'p',
        children: [{ text: '' }],
      },
      { at: [0] },
    );
  };

  return editor;
}
