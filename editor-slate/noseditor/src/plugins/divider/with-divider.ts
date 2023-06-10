import { type Editor, type Element } from 'slate';

import { isDividerElement } from './utils';

export const withDivider = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element: Element) => {
    return isDividerElement(element) || isVoid(element);
  };

  return editor;
};
