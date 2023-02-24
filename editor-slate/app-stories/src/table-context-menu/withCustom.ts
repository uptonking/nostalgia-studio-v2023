import eventemitter from 'event-emitter';
import { Editor } from 'slate';

export const withTableUtils = <T extends Editor>(editor: T) => {
  const e = editor as T & {
    tableState: any;
    on: any;
    once: any;
    off: any;
    emit: any;
  };

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
