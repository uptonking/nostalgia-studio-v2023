import React from 'react';

import type { ITreeViewField } from '@datalking/pivot-core';
import { useListTreeQuery } from '@datalking/pivot-store';

import { useCurrentTable } from '../../hooks/use-current-table';
import { TreeView } from './tree-view';

interface IProps {
  field: ITreeViewField;
  indentationWidth?: number;
}

export const TreeViewBoard: React.FC<IProps> = ({ field, ...rest }) => {
  const table = useCurrentTable();
  const listRecords = useListTreeQuery({
    tableId: table.id.value,
    fieldId: field.id.value,
  });

  if (listRecords.isLoading) {
    // TODO: loading ui
    return null;
  }

  return (
    <TreeView
      field={field}
      records={listRecords.data?.records ?? []}
      {...rest}
    />
  );
};

export default TreeViewBoard;
