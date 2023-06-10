/**
 * @description render row
 * @author wangfupeng
 */

import { type Element as SlateElement } from 'slate';
import { h, jsx, type VNode } from 'snabbdom';

import { type IDomEditor } from '@wangeditor/core';

function renderTableRow(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  // const vnode = <tr>{children}</tr>;
  const vnode = h('tr', {}, children);
  return vnode;
}

export default renderTableRow;
