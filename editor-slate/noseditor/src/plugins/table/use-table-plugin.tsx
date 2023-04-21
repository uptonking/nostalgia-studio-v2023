import React from 'react';

import type { CreateNosPluginType } from '../types';
import { CustomTable, CustomTableCell, CustomTableRow } from './components';
import * as handlers from './handlers';
import {
  isTableCellElement,
  isTableElement,
  isTableRowElement,
} from './utils/utils';
import { withTable } from './with-table';

export const useTablePlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withTable,
    handlers,
    renderElement: (props) => {
      if (isTableElement(props.element)) {
        return <CustomTable {...props} />;
      }

      if (isTableRowElement(props.element)) {
        return <CustomTableRow {...props} />;
      }

      if (isTableCellElement(props.element)) {
        return <CustomTableCell {...props} />;
      }

      return null;
    },
  };
};
