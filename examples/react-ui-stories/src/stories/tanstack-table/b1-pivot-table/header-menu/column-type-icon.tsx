import React from 'react';

import { HashIcon, MultiSelectIcon, TextIcon } from '../icons';
import { ColumnTypes } from '../utils';

export function ColumnTypeIcon({ dataType }) {
  function getPropertyIcon(dataType) {
    switch (dataType) {
      case ColumnTypes.NUMBER:
        return <HashIcon />;
      case ColumnTypes.TEXT:
        return <TextIcon />;
      case ColumnTypes.SELECT:
        return <MultiSelectIcon />;
      default:
        return null;
    }
  }

  return getPropertyIcon(dataType);
}
