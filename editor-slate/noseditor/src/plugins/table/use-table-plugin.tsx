import React from 'react';

import type { UseNosPlugin } from '../types';
import { CustomTable, CustomTableCell, CustomTableRow } from './components';
import * as handlers from './handlers';
import {
  isTableCellElement,
  isTableElement,
  isTableRowElement,
} from './utils/utils';
import { withTable } from './with-table';

export const useTablePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withTable,
    handlers,
    renderElement: (props) => {
      if (isTableElement(props.element)) {
        // @ts-expect-error fix-types
        return <CustomTable {...props} />;
      }

      if (isTableRowElement(props.element)) {
        // @ts-expect-error fix-types
        return <CustomTableRow {...props} />;
      }

      if (isTableCellElement(props.element)) {
        // @ts-expect-error fix-types
        return <CustomTableCell {...props} />;
      }

      return null;
    },
  };
};
