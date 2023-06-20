import { type VNode } from 'snabbdom';

import { type Watarble } from '../watarble';
import { modelNodeToVnode } from './render-element';

export function defaultRender(elemNode, watarble: Watarble): VNode[] {
  const children: VNode[] = (elemNode.children as VNode[]) || [];
  const vnode = children.map((child) => modelNodeToVnode(child, watarble));
  return vnode;
}
