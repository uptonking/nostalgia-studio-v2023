import type React from 'react';

import isHotkey from 'is-hotkey';
import { type Editor, Path, Range, Transforms } from 'slate';

export const onKeyDown = (editor: Editor) => (e: React.KeyboardEvent) => {
  editor.emit('keydown', e);
};

export const onMouseDown = (editor: Editor) => (e: React.KeyboardEvent) => {
  // console.log(';; tbMouseDown');
  editor.emit('mousedown', e);
};

export const onBlur = (editor: Editor) => (e: React.KeyboardEvent) => {
  // console.log(';; tbBlur');
  editor.emit('blur', e);
};
