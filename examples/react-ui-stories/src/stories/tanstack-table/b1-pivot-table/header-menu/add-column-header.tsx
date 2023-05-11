import React from 'react';

import { PlusIcon } from '../icons';
import { ActionNames, Constants } from '../utils';

export function AddColumnHeader({  dataDispatch }) {
  return (
    <div className='th noselect d-inline-block'>
      <div
        className='th-content d-flex justify-content-center'
        onClick={(e) =>
          dataDispatch({
            type: ActionNames.ADD_COLUMN_TO_LEFT,
            columnId: Constants.ADD_COLUMN_ID,
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
