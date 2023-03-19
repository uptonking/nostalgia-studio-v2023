import React from 'react';

import isHotkey from 'is-hotkey';
import { Editor } from 'slate';

// export const onBlur = (editor: Editor) => (e: React.KeyboardEvent) => {
//   console.log(';; brBlur');
// };

export const onKeyDown = (editor: Editor) => {
  const handleEvent = (e: any) => {
    e.preventDefault();
    editor.insertText('\n');
  };

  return (e: React.KeyboardEvent) => {
    if (e.defaultPrevented) {
      return;
    }

    if (isHotkey('shift+enter', e)) {
      handleEvent(e);
      return;
    }

    const [entry] = Editor.nodes(editor, {
      match: (node) => false,
    });

    if (isHotkey('enter', e) && entry) {
      handleEvent(e);
      return;
    }
  };
};
