import diff from 'fast-diff';

import cloneDeep from './util/cloneDeep';
import isEqual from './util/isEqual';

export { cloneDeep, diff, isEqual };

export { AttributeMap, type AttributeMapType } from './AttributeMap';
export { Delta } from './Delta';
export { default as Op, OpIterator } from './Op';
