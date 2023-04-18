import type { Element } from 'slate';

import type { SemanticNode } from './types';

/**
 * { slateElement: dragSortInfoNode }
 */
export const ELEMENT_TO_SEMANTIC_PATH: WeakMap<Element, SemanticNode[]> =
  new WeakMap();

// todo remove test below
window['ele2path'] = ELEMENT_TO_SEMANTIC_PATH;
