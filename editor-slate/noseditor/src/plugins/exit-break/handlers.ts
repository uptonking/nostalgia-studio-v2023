import React from 'react';

import isHotkey from 'is-hotkey';
import { Editor, Path, Range, Transforms } from 'slate';

import { ParagraphType } from '../paragraph/types';

export const onKeyDown = (editor: Editor) => (e: React.KeyboardEvent) => {
  if (!editor.selection || Range.isExpanded(editor.selection)) {
    return;
  }

  if (isHotkey(['mod+enter'], e)) {
    const path = Editor.path(editor, editor.selection, { depth: 1 });

    Transforms.insertNodes(
      editor,
      {
        type: ParagraphType,
        children: [{ text: '' }],
      },
      { at: Path.next(path), select: true },
    );
  }

  if (isHotkey(['shift+mod+enter'], e)) {
    const path = Editor.path(editor, editor.selection, { depth: 1 });

    Transforms.insertNodes(
      editor,
      {
        type: ParagraphType,
        children: [{ text: '' }],
      },
      { at: path, select: true },
    );
  }
};
