import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import type { MarkConfig, NodeConfig } from '../types/pm-config';
import { fixExcludes } from './create-editor';
import { sortByOrder } from './sort-by-order';

// import { sanitizeNodes } from '@atlaskit/adf-schema';

/** 创建prosemirror可用的schema，主要是计算出nodes和marks */
export function createSchema(editorConfig: {
  marks: MarkConfig[];
  nodes: NodeConfig[];
}) {
  const marks = fixExcludes(
    editorConfig.marks.sort(sortByOrder('marks')).reduce((acc, mark) => {
      acc[mark.name] = mark.mark;
      return acc;
    }, {} as { [nodeName: string]: MarkSpec }),
  );

  // const nodes = sanitizeNodes(
  const nodes = editorConfig.nodes
    .sort(sortByOrder('nodes'))
    .reduce((acc, node) => {
      acc[node.name] = node.node;
      return acc;
    }, {} as { [nodeName: string]: NodeSpec });

  return new Schema({ nodes, marks });
}
