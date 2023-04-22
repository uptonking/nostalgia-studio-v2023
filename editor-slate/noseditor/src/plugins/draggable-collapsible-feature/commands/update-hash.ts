import { nanoid } from 'nanoid';
import { Editor, Node, Transforms } from 'slate';

import type { HashedElement, SemanticNode } from '../types';

export const updateHash = (editor: Editor, semanticNode: SemanticNode) => {
  const { element, index } = semanticNode;

  Transforms.setNodes<HashedElement & Node>(
    editor,
    { hash: nanoid(4) },
    {
      at: [index],
      match: (node) => node === element,
    },
  );
};
