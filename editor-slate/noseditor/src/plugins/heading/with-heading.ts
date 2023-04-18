import { Editor } from 'slate';

import { isHeadingElement } from './utils';

export const withHeading = (editor: Editor) => {
  // @ts-expect-error fix-types
  const { isCollapsibleElement } = editor;

  // @ts-expect-error fix-types
  editor.isCollapsibleElement = (element) => {
    return isHeadingElement(element) || isCollapsibleElement(element);
  };

  return editor;
};

