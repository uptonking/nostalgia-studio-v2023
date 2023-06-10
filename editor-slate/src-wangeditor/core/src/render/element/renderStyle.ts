/**
 * @description 添加文本相关的样式
 * @author wangfupeng
 */

import { type Element as SlateElement } from 'slate';
import { type VNode } from 'snabbdom';
import { RENDER_STYLE_HANDLER_LIST } from '../index';

/**
 * 渲染样式
 * @param elem slate elem node
 * @param vnode elem Vnode
 */
function renderStyle(elem: SlateElement, vnode: VNode): VNode {
  let newVnode = vnode;

  RENDER_STYLE_HANDLER_LIST.forEach((styleHandler) => {
    newVnode = styleHandler(elem, vnode);
  });

  return newVnode;
}

export default renderStyle;
