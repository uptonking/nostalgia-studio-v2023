import React from 'react';

import cx from 'clsx';
import { RenderElementProps } from 'slate-react';

import { css } from '@linaria/core';

import { themed } from '../../../styles';
import type { ElementProps } from '../../types';
import type { TableCellElement, TableElement, TableRowElement } from '../types';

export function CustomTableCell(props: ElementProps) {
  const { attributes, children } = props;
  const element = props.element as TableCellElement;

  const { colSpan = 1, rowSpan = 1 } = element;

  return (
    <td
      {...attributes}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cx(cellCss, {
        [headerCellCss]: element.header === 'visible',
      })}
    >
      {children}
    </td>
  );
}

const cellCss = css`
  min-width: 20px;
  min-height: 20px;
  padding: 8px;
  overflow: hidden;
  word-break: break-all;
  overflow-wrap: break-word;
`;

const headerCellCss = css`
  background-color: ${themed.color.background.hover};
`;
