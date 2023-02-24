/**
 * @description render todo
 * @author wangfupeng
 */

import { Element as SlateElement, Transforms } from 'slate';
import { h, jsx, VNode } from 'snabbdom';

import { DomEditor, IDomEditor } from '@wangeditor/core';

import { TodoElement } from './custom-types';

/**
 * render todo elem
 * @param elemNode slate elem
 * @param children children
 * @param editor editor
 * @returns vnode
 */
function renderTodo(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  // 判断 disabled
  let disabled = false;
  if (editor.isDisabled()) disabled = true;

  const { checked } = elemNode as TodoElement;
  // const vnode = (
  //   <div style={{ margin: '5px 0' }}>
  //     <span contentEditable={false} style={{ marginRight: '0.5em' }}>
  //       <input
  //         type='checkbox'
  //         checked={checked}
  //         disabled={disabled}
  //         // eslint-disable-next-line react/no-unknown-property
  //         on={{
  //           change: (event) => {
  //             const path = DomEditor.findPath(editor, elemNode);
  //             const newProps: Partial<TodoElement> = {
  //               // @ts-ignore
  //               checked: event.target.checked,
  //             };
  //             Transforms.setNodes(editor, newProps, { at: path });
  //           },
  //         }}
  //       />
  //     </span>
  //     <span>{children}</span>
  //   </div>
  // );

  const vnode = h('div', { style: { margin: '5px 0' } }, [
    h(
      'span',
      {
        attrs: { contentEditable: false },
        style: { marginRight: '0.5em' },
      },
      h('input', {
        attrs: {
          type: 'checkbox',
          checked,
          disabled,
        },
        on: {
          change: (event) => {
            const path = DomEditor.findPath(editor, elemNode);
            const newProps: Partial<TodoElement> = {
              // @ts-ignore
              checked: event.target.checked,
            };
            Transforms.setNodes(editor, newProps, { at: path });
          },
        },
      }),
    ),
    h('span', {}, children),
  ]);

  return vnode;
}

const renderTodoConf = {
  type: 'todo', // 和 elemNode.type 一致
  renderElem: renderTodo,
};

export { renderTodoConf };
