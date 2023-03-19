import React from 'react';

import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';

import type { ElementProps } from '../../types';
import type { TableCellElement, TableElement, TableRowElement } from '../types';
import { getNextRowSpan } from '../utils/common';

export function CustomTableRow(
  props: ElementProps & { element: TableRowElement },
) {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const rowPath = ReactEditor.findPath(editor, element);
  const minRow = getNextRowSpan(editor, rowPath);

  return (
    <>
      <tr {...attributes} className='nos-table-row'>
        {children}
      </tr>
      {minRow > 1 &&
        Array.from({ length: minRow - 1 }).map((_, index) => (
          <tr key={index} />
        ))}
    </>
  );
}
