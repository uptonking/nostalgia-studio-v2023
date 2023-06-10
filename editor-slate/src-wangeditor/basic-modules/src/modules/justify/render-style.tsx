/**
 * @description render justify style
 * @author wangfupeng
 */

import { type Descendant, Element } from 'slate';
import { jsx, type VNode } from 'snabbdom';
import { addVnodeStyle } from '../../utils/vdom';
import { type JustifyElement } from './custom-types';

/**
 * 添加样式
 * @param node slate elem
 * @param vnode vnode
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode): VNode {
  if (!Element.isElement(node)) return vnode;

  const { textAlign } = node as JustifyElement; // 如 'left'/'right'/'center' 等
  let styleVnode: VNode = vnode;

  if (textAlign) {
    addVnodeStyle(styleVnode, { textAlign });
  }

  return styleVnode;
}
