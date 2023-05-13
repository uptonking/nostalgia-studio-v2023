import React from 'react';

import { HashIcon, MultiSelectIcon, TextIcon } from '../icons';
import { COLUMN_TYPES } from '../utils';

export function ColumnTypeIcon({ dataType }) {

  switch (dataType) {
    case COLUMN_TYPES.Number:
      return <HashIcon />;
    case COLUMN_TYPES.Text:
      return <TextIcon />;
    case COLUMN_TYPES.Select:
      return <MultiSelectIcon />;
    default:
      return null;
  }
}
