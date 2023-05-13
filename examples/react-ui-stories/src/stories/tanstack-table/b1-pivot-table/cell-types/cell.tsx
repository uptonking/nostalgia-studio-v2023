import React, { useMemo } from 'react';

import { COLUMN_TYPES } from '../utils';
import { NumberCell } from './number-cell';
import { SelectCell } from './select-cell';
import { TextCell } from './text-cell';

export function Cell(props) {
  const {
    row: { index },
    column: {
      columnDef: { id, dataType, options },
    },
    table,
  } = props;
  // console.log(';; cell ', props)

  const initialValue = props.cell.getValue();

  switch (dataType) {
    case COLUMN_TYPES.Text:
      return (
        <TextCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          dataDispatch={table.options.meta.dataDispatch}
        />
      );
    case COLUMN_TYPES.Number:
      return (
        <NumberCell
          initialValue={initialValue}
          rowIndex={index}
          columnId={id}
          dataDispatch={table.options.meta.dataDispatch}
        />
      );
    case COLUMN_TYPES.Select:
      return (
        <SelectCell
          initialValue={initialValue}
          options={options}
          rowIndex={index}
          columnId={id}
          dataDispatch={table.options.meta.dataDispatch}
        />
      );
    default:
      return <span />;
  }
}
