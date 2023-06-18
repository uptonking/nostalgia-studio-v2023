import { type VNode } from 'snabbdom';

import { type Watarble } from '../watarble';
import { modelNodeToVnode } from './render-element';

export function defaultRender(elemNode, watarble: Watarble) {
  const children = elemNode.children || [];
  const vnode = children.map((child) => modelNodeToVnode(child, watarble));
  return vnode;
}
