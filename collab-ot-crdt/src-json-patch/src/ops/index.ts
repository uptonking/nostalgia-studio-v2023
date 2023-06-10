import { test } from './test';
import { add } from './add';
import { remove } from './remove';
import { replace } from './replace';
import { copy } from './copy';
import { move } from './move';
import { increment } from './increment';
import { type JSONPatchOpHandlerMap } from '../types';

export { test, add, remove, replace, copy, move, increment };

export function getTypes(custom?: JSONPatchOpHandlerMap) {
  return {
    test,
    add,
    remove,
    replace,
    copy,
    move,
    '@inc': increment,
    ...custom,
  };
}
