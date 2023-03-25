import React from 'react';

import isHotkey from 'is-hotkey';
import { Editor, Path } from 'slate';

import { ExtendedEditor } from '../../slate-extended/extended-editor';
import { moveItemsBack, moveItemsForward } from './transforms';
import { isListItemElement } from './utils';

/**
 * tab           ->  indent
 * shift + tab   ->  unindent
 */
export const onKeyDown = (editor: Editor) => (e: React.KeyboardEvent) => {
  if (isHotkey(['tab'], e)) {
    e.preventDefault();

    const entries = Array.from(
      Editor.nodes(editor, {
        match: ExtendedEditor.isNestingElementCurried(editor),
      }),
    );

    const [firstEntry] = entries;
    if (firstEntry) {
      const path = firstEntry[1];

      const prevEntry = Path.hasPrevious(path)
        ? Editor.previous(editor, { at: path })!
        : null;

      if (prevEntry && isListItemElement(prevEntry[0])) {
        const [prevNode] = prevEntry;
        for (const entry of entries) {
          moveItemsForward(editor, entry[0], entry[1], prevNode.depth + 1);
        }
      }
    }
  }

  if (isHotkey(['shift+tab'], e)) {
    e.preventDefault();
    const entries = Editor.nodes(editor, {
      match: ExtendedEditor.isNestingElementCurried(editor),
    });
    for (const entry of entries) {
      moveItemsBack(editor, entry[0], entry[1]);
    }
  }
};
