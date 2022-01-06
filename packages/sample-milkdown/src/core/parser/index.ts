import type { Schema } from 'prosemirror-model';
import type { RemarkOptions } from 'remark';
import type { Processor } from 'unified';

import { createStack } from './stack';
import { State } from './state';
import type { InnerParserSpecMap } from './types';

/** 返回一个方法，能将md str转换成PMNode */
export function createParser(
  schema: Schema,
  specMap: InnerParserSpecMap,
  remark: Processor<RemarkOptions>,
) {
  return (text: string) => {
    const state = new State(createStack(), schema, specMap);
    state.run(remark, text);
    return state.toDoc();
  };
}

export * from './types';
