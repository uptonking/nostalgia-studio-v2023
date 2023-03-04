import React from 'react';

import cx from 'classnames';
import { RenderElementProps } from 'slate-react';

import { TableCellElement } from '../customTypes';

export function CustomTableCell(props: RenderElementProps) {
  const { attributes, children, element } = props;
  // console.log(';; cell ', props);

  const { colSpan = 1, rowSpan = 1 } = element as TableCellElement;
  return (
    <td
      {...attributes}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cx('yt-e-table-cell', {
        headerCell: (element as TableCellElement).header === 'visible',
      })}
    >
      {children}
    </td>
  );
}
