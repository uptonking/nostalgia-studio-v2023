import { h, type VNode } from 'snabbdom';

import { modelNodeToVnode } from '../render-element';
import { customRender } from '../utils';
import { tableBaseCss } from './table.styles';

export const tableConfig = {
  type: 'table',
  renderFn: (elemNode, watarble): VNode => {
    const children = elemNode.children || [];
    // console.log(';; tb ', children);

    const vnode = h(
      'div',
      { class: { [tableBaseCss]: true } },
      h(
        'div',
        {
          class: { idTable: true },
          style: {
            // width: watarble.state.table.getTotalSize() + 'px',
          },
        },
        [
          // / theader
          h(
            'div',
            {},
            watarble.state.table.getHeaderGroups().map((headerGroup) => {
              return h(
                'div',
                {
                  key: headerGroup.id,
                  style: {
                    position: 'relative',
                    height: '32px',
                  },
                },
                headerGroup.headers.map((header) => {
                  // console.log(
                  //   ';; th ',
                  //   header,
                  //   flexRender(
                  //     header.column.columnDef.header,
                  //     header.getContext(),
                  //   ),
                  // );

                  return h(
                    'div',
                    {
                      key: header.id,
                      class: { thTd: true },
                      style: {
                        position: 'absolute',
                        left: header.getStart() + 'px',
                        width: header.getSize() + 'px',
                        // use fixed height to make empty th filled
                        height: '32px',
                      },
                    },
                    header.isPlaceholder
                      ? []
                      : customRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        ),
                  );
                }),
              );
            }),
          ),
          // / body-rows
          ...children.map((row, index: number) => {
            // console.log(';; tr ', row);

            return h(
              'div',
              {
                class: { idRow: true },
                style: {
                  position: 'relative',
                  display: 'flex',
                  height: '32px',
                },
                key: row.id,
              },
              row.getVisibleCells().map((cell) => {
                // console.log(';; td ', cell, flexRender(cell.column.columnDef.cell, cell.getContext()),);

                return h(
                  'div',
                  {
                    key: cell.id,
                    class: { thTd: true },
                    style: {
                      position: 'absolute',
                      padding: '0.5rem',
                      left: cell.column.getStart() + 'px',
                      width: cell.column.getSize() + 'px',
                    },
                  },
                  customRender(cell.column.columnDef.cell, cell.getContext()),
                );
              }),
            );
          }),
        ],
      ),
    );

    // console.log(';; tb-vnode ', vnode);

    return vnode;
  },
};

export const tableConfig1 = {
  type: 'table1',
  renderFn: (elemNode, watarble): VNode => {
    const children = elemNode.children || [];
    const vnode = h(
      'table',
      h(
        'tbody',
        children.map((child: Node, index: number) => {
          return modelNodeToVnode(child, watarble);
        }),
      ),
    );
    return vnode;
  },
};

export const rowConfig = {
  type: 'tableRow',
  renderFn: (elemNode, watarble): VNode => {
    const children = elemNode.children || [];
    const vnode = h(
      'tr',
      children.map((child: Node, index: number) => {
        return modelNodeToVnode(child, watarble);
      }),
    );
    return vnode;
  },
};

export const cellConfig = {
  type: 'tableCell',
  renderFn(elemNode, watarble): VNode {
    const { children = [], colSpan = 1, rowSpan = 1 } = elemNode;
    const vnode = h(
      'td',
      { colSpan, rowSpan },
      children.map((child: Node, index: number) => {
        return modelNodeToVnode(child, watarble);
      }),
    );
    return vnode;
  },
};
