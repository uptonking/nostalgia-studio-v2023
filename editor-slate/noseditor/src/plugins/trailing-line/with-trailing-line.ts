import {
  Editor,
  type Location,
  Node,
  type NodeEntry,
  Path,
  Range,
  Transforms,
} from 'slate';

import { isNullOrUndefined } from '../../utils';
import { createParagraphElement, isParagraphElement } from '../paragraph/utils';

const isTrailingLine = (node: Node) => {
  return isParagraphElement(node) && Node.string(node) === '';
};

/**
 * insert a empty paragraph as trailing line
 */
const insertTrailingLine = (editor: Editor, at: Location) => {
  Transforms.insertNodes(editor, createParagraphElement(), { at });
};

export const withTrailingLine = (editor: Editor) => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    if (isNullOrUndefined(editor.selection)) {
      return;
    }

    // to-better/ to use insert if not trailing line, instead of insert then remove
    insertBreak();

    if (editor.children.length > 1) {
      // try to find whether there is more than one trailing line
      // if there is only one child, there is no sense to remove it; otherwise remove

      // get last node and last path
      const lastPath = [editor.children.length - 1];
      const [lastNode] = Editor.node(editor, lastPath);

      // check if cursor is before trailing line
      const isCursorBeforeTrailingLine = Range.includes(
        editor.selection,
        Editor.end(editor, Path.previous(lastPath)),
      );

      if (isTrailingLine(lastNode) && isCursorBeforeTrailingLine) {
        // remove trailing line before insert break, on order to keep only one trailing line
        Transforms.removeNodes(editor, { at: lastPath });
      }
    }
  };

  editor.normalizeNode = ([node, path]: NodeEntry) => {
    if (Path.equals(path, [])) {
      if (editor.children.length > 0) {
        const lastPath = [editor.children.length - 1];
        const [lastNode] = Editor.node(editor, lastPath);

        if (!isTrailingLine(lastNode)) {
          // insert trailing line if the last one is not a trailing line
          insertTrailingLine(editor, Path.next(lastPath));
        }
      } else {
        // if no children insert trailing line
        insertTrailingLine(editor, [0]);
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
