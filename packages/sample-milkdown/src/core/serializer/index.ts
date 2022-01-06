import type { Node, Schema } from 'prosemirror-model';
import type { RemarkOptions } from 'remark';
import type { Processor } from 'unified';

import { createStack } from './stack';
import { State } from './state';
import type { InnerSerializerSpecMap } from './types';

/** 高阶函数，返回一个方法，可以将PMNode转换成md str */
export function createSerializer(
  schema: Schema,
  specMap: InnerSerializerSpecMap,
  remark: Processor<RemarkOptions>,
) {
  return (content: Node) => {
    const state: State = new State(createStack(), schema, specMap);
    state.run(content);
    return state.toString(remark);
  };
}

export * from './types';
