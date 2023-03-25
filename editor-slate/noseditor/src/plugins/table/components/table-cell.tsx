import React from 'react';

import cx from 'clsx';
import { RenderElementProps } from 'slate-react';

import type { ElementProps } from '../../types';
import type { TableCellElement, TableElement, TableRowElement } from '../types';

export function CustomTableCell(
  props: ElementProps & { element: TableCellElement },
) {
  const { attributes, children, element } = props;
  // console.log(';; cell ', props);

  const { colSpan = 1, rowSpan = 1 } = element;
  return (
    <td
      {...attributes}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cx('nos-table-cell', {
        headerCell: element.header === 'visible',
      })}
    >
      {children}
    </td>
  );
}
