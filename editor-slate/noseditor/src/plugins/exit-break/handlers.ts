import React from 'react';

import isHotkey from 'is-hotkey';
import { Editor, Path, Range, Transforms } from 'slate';

import { ParagraphSpec } from '../paragraph/utils';

export const onKeyDown = (editor: Editor) => (e: React.KeyboardEvent) => {
  if (!editor.selection || Range.isExpanded(editor.selection)) {
    return;
  }

  if (isHotkey(['mod+enter'], e)) {
    const path = Editor.path(editor, editor.selection, { depth: 1 });

    Transforms.insertNodes(
      editor,
      {
        type: ParagraphSpec,
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
        type: ParagraphSpec,
        children: [{ text: '' }],
      },
      { at: path, select: true },
    );
  }
};
