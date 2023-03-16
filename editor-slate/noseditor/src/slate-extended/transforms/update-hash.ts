import { nanoid } from 'nanoid';
import { Editor, Transforms } from 'slate';

import { SemanticNode } from '../types';

export const updateHash = (editor: Editor, semanticNode: SemanticNode) => {
  const { element, index } = semanticNode;

  Transforms.setNodes(
    editor,
    { hash: nanoid(4) },
    {
      at: [index],
      match: (node) => node === element,
    },
  );
};
