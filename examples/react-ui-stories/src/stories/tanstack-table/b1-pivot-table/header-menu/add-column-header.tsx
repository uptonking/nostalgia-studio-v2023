import React from 'react';

import { PlusIcon } from '../icons';
import { ACTION_TYPES, COLUMN_PLACEHOLDER_ID } from '../utils';

export function AddColumnHeader({ dataDispatch }) {
  return (
    <div className='th noselect d-inline-block'>
      <div
        className='th-content d-flex justify-content-center'
        onClick={(e) =>
          dataDispatch({
            type: ACTION_TYPES.Add_column_to_left,
            columnId: COLUMN_PLACEHOLDER_ID,
            focus: true,
          })
        }
      >
        <span className='svg-icon-sm svg-gray'>
          <PlusIcon />
        </span>
      </div>
    </div>
  );
}
