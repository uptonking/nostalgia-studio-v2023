/**
 * @description render elem
 * @author wangfupeng
 */

import { type Element as SlateElement } from 'slate';
import { h, jsx, type VNode } from 'snabbdom';

import { type IDomEditor } from '@wangeditor/core';

/**
 * render block quote elem
 * @param elemNode slate elem
 * @param children children
 * @param editor editor
 * @returns vnode
 */
function renderBlockQuote(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  // const vnode = <blockquote>{children}</blockquote>;
  const vnode = h('blockquote', {}, children);
  return vnode;
}

export const renderBlockQuoteConf = {
  type: 'blockquote',
  renderElem: renderBlockQuote,
};
