import { Element } from 'slate';

import { SemanticNode } from './types';

export const ELEMENT_TO_SEMANTIC_PATH: WeakMap<Element, SemanticNode[]> =
  new WeakMap();
