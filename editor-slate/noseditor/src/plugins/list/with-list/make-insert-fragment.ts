import { Editor, type Node } from 'slate';

import {
  DraggableCollapsibleEditor,
  type NestableElement,
} from '../../draggable-collapsible-feature';

const getMin = (array: number[]) =>
  array.reduce((acc, x) => Math.min(acc, x), Infinity);

export const makeInsertFragment = (editor: DraggableCollapsibleEditor) => {
  const { insertFragment } = editor;

  return (fragment: Node[]) => {
    let baseDepth = 0;
    const [entry] = Editor.nodes(editor, {
      match: DraggableCollapsibleEditor.isNestingElementCurried(editor),
    });
    if (entry) {
      const [node] = entry;
      baseDepth = node.depth;
    }

    const listItems: NestableElement[] = [];
    for (const item of fragment) {
      if (!DraggableCollapsibleEditor.isNestableElement(editor, item)) {
        break;
      }

      listItems.push(item);
    }

    // adjust depth on pasting
    if (listItems.length > 0) {
      const minDepth = getMin(listItems.map((item) => item.depth));

      for (const listItem of listItems) {
        listItem.depth = listItem.depth + baseDepth - minDepth;
      }
    }

    insertFragment(fragment);
  };
};
