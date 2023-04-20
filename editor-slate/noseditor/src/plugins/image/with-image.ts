import { Editor, Element } from 'slate';

import { isImageElement } from './utils';

export const withImage = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element: Element) => {
    return isImageElement(element) || isVoid(element);
  };

  return editor;
};
