import type { Element } from 'slate';

import type { SemanticNode } from './types';

/**
 * { slateElement: draggableNode }
 */
export const ELEMENT_TO_SEMANTIC_PATH: WeakMap<Element, SemanticNode[]> =
  new WeakMap();

// todo remove test
window['ele2path'] = ELEMENT_TO_SEMANTIC_PATH;
