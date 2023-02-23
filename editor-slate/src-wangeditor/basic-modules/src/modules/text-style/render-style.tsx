/**
 * @description render text style
 * @author wangfupeng
 */

import { Descendant } from 'slate';
import { h, jsx, VNode } from 'snabbdom';

import { StyledText } from './custom-types';

/**
 * 添加样式
 * @param node slate text
 * @param vnode vnode
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode): VNode {
  const { bold, italic, underline, code, through, sub, sup } =
    node as StyledText;
  let styleVnode: VNode = vnode;

  // color bgColor 在另外的菜单

  if (bold) {
    // styleVnode = <strong>{styleVnode}</strong>;
    styleVnode = h('strong', {}, styleVnode);
  }
  if (code) {
    // styleVnode = <code>{styleVnode}</code>;
    styleVnode = h('code', {}, styleVnode);
  }
  if (italic) {
    // styleVnode = <em>{styleVnode}</em>;
    styleVnode = h('em', {}, styleVnode);
  }
  if (underline) {
    // styleVnode = <u>{styleVnode}</u>;
    styleVnode = h('u', {}, styleVnode);
  }
  if (through) {
    // styleVnode = <s>{styleVnode}</s>;
    styleVnode = h('s', {}, styleVnode);
  }
  if (sub) {
    // styleVnode = <sub>{styleVnode}</sub>;
    styleVnode = h('sub', {}, styleVnode);
  }
  if (sup) {
    // styleVnode = <sup>{styleVnode}</sup>;
    styleVnode = h('sup', {}, styleVnode);
  }

  return styleVnode;
}
