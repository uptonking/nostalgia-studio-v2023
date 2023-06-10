import { type Editor, type Element, Node } from 'slate';
import crawl from 'tree-crawl';

import {
  isHeading1Element,
  isHeading2Element,
  isHeading3Element,
} from '../heading/utils';
import { isParagraphElement } from '../paragraph/utils';
import { DraggableCollapsibleEditor } from './collapsible-editor';

export const crawlChildren = <
  T extends {
    children: T[];
  },
>(
  children: T[],
  iteratee: (node: T, context: crawl.Context<T>) => void,
  options: crawl.Options<T> = {},
): void => {
  const root = { children } as T;

  crawl<T>(
    root,
    (node, context) => {
      if (node === root) {
        return;
      }

      iteratee(node, context);
    },
    options,
  );
};

const getSemanticLevel = (editor: Editor, element: Element) => {
  if (
    isParagraphElement(element) &&
    Node.string(element) === '' &&
    editor.children.length > 0 &&
    editor.children[editor.children.length - 1]['id'] === element['id']
  ) {
    return 1;
  }

  if (isHeading1Element(element)) {
    return 2;
  }

  if (isHeading2Element(element)) {
    return 3;
  }

  if (isHeading3Element(element)) {
    return 4;
  }

  return Infinity;
};

export const compareLevels =
  (editor: DraggableCollapsibleEditor) => (a: Element, b: Element) => {
    if (
      DraggableCollapsibleEditor.isNestableElement(editor, a) &&
      DraggableCollapsibleEditor.isNestableElement(editor, b)
    ) {
      return Math.sign(a.depth - b.depth);
    }

    return Math.sign(getSemanticLevel(editor, a) - getSemanticLevel(editor, b));
  };
