import {
  Compiler,
  parser,
  treeShakeModule,
} from '@alex.garcia/unofficial-observablehq-compiler';

export function ojsToJs(ojs, options) {
  const compile = new Compiler();

  const outJs = compile.module(ojs);

  return outJs;
}

export default ojsToJs;
