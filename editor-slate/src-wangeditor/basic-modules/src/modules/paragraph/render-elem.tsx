/**
 * @description render paragraph elem
 * @author wangfupeng
 */

import { type Element as SlateElement } from 'slate';
import { h, jsx, type VNode } from 'snabbdom';

import { type IDomEditor } from '@wangeditor/core';

/**
 * render paragraph elem
 * @param elemNode slate elem
 * @param children children
 * @param editor editor
 * @returns vnode
 */
function renderParagraph(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  // const vnode = <p>{children}</p>;
  const vnode = h('p', {}, children);
  return vnode;
}

export const renderParagraphConf = {
  type: 'paragraph',
  renderElem: renderParagraph,
};
