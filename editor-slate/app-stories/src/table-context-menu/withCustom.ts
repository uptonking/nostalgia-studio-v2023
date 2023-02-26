import eventemitter from 'event-emitter';
import { Editor } from 'slate';

import type { ExtendedEditor } from './customTypes';

/**
 * editor plugin with event-emitter
 */
export const withTableUtils = <T extends Editor>(editor: T) => {
  const e = editor as T & ExtendedEditor;

  const { onChange } = e;

  const emitter = eventemitter();

  e.tableState = {
    showSelection: false,
    selection: [],
  };

  e.on = (type, listener) => {
    emitter.on(type, listener);
  };
  e.once = (type, listener) => {
    emitter.once(type, listener);
  };
  e.off = (type, listener) => {
    emitter.off(type, listener);
  };
  e.emit = (type, ...args: any[]) => {
    emitter.emit(type, ...args);
  };

  e.onChange = () => {
    e.emit('change');
    // 必须调用
    onChange();
  };

  return e;
};
