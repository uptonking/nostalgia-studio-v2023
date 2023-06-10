import React from 'react';

import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';

import { css } from '@linaria/core';

import { themed } from '../../../styles';
import { type ElementProps } from '../../types';
import {
  type TableCellElement,
  type TableElement,
  type TableRowElement,
} from '../types';
import { getNextRowSpan } from '../utils/common';

export function CustomTableRow(props: ElementProps) {
  const { attributes, children } = props;
  const element = props.element as TableRowElement;

  const editor = useSlate() as ReactEditor;

  const rowPath = ReactEditor.findPath(editor, element);
  const minRow = getNextRowSpan(editor, rowPath);

  return (
    <>
      <tr {...attributes} className={tableRowCss}>
        {children}
      </tr>
      {minRow > 1 &&
        Array.from({ length: minRow - 1 }).map((_, index) => (
          <tr key={index} />
        ))}
    </>
  );
}

const tableRowCss = css`
  height: 45px;
`;
