import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

import { MarkConfig, NodeConfig } from '../types';
import { fixExcludes } from './create-plugins';
import { sortByOrder } from './ranks';

/** 创建prosemirror可用的schema对象 */
export function createSchema(editorConfig: {
  marks: MarkConfig[];
  nodes: NodeConfig[];
}) {
  const createdMarks = fixExcludes(
    editorConfig.marks.sort(sortByOrder('marks')).reduce(
      (acc, mark) => {
        acc[mark.name] = mark.mark;
        return acc;
      },
      {} as { [nodeName: string]: MarkSpec },
    ),
  );
  const createdNodes = editorConfig.nodes.sort(sortByOrder('nodes')).reduce(
    (acc, node) => {
      acc[node.name] = node.node;
      return acc;
    },
    {} as { [nodeName: string]: NodeSpec },
  );

  return new Schema({ nodes: createdNodes, marks: createdMarks });
}
