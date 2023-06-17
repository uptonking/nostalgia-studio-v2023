import { type VNode } from 'snabbdom';

import { type Watarble } from '../watarble';

export function modelNodeToVnode(item: any, watarble: any) {
  const vnode = renderElement(item, watarble);
  normalizeVnode(vnode);
  return vnode;
}

function normalizeVnode(vnode) {}

export function renderElement(elemNode, watarble: Watarble): VNode {
  const { type } = elemNode;

  const renderFn = getRendererForType(type, watarble);

  const vnode = renderFn(elemNode, watarble);

  // fix vnode

  return vnode;
}

export function getRendererForType(type: string, watarble: Watarble) {
  const fn = watarble.config.renderer.elements.get(type);
  return fn || watarble.config.renderer.defaultRender;
}
