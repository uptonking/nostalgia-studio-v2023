import { Editor, Element, Location, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import type { TableElement } from '../types';
import {
  createCellElement,
  createRowElement,
  createTableElement,
} from '../utils/utils';

// import { createImageNode } from './utils';

export const insertTableByRowColNumber = (
  editor: Editor,
  { row = 3, col = 3 } = {},
) => {
  // const image: ImageElement = createImageNode({ url })

  const rows = Array(row)
    .fill(1)
    .map((_) =>
      createRowElement(
        Array(col)
          .fill(1)
          .map((_) => createCellElement()),
      ),
    );

  const tableNode = createTableElement(rows);

  // const tableNode: any = {
  //   type: 'table',
  //   children: [
  //     {
  //       type: 'tableRow',
  //       children: [
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       type: 'tableRow',
  //       children: [
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //         {
  //           type: 'tableCell',
  //           children: [
  //             {
  //               type: 'paragraph',
  //               children: [{ text: '' }],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // };

  Transforms.insertNodes(editor, tableNode);
};
