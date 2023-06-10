import { type Editor } from 'slate';

import { isLinkElement } from './utils';

export const withLink = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return isLinkElement(element) || isInline(element);
  };

  return editor;
};
