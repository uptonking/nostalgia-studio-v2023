import { CellAttributes, TableHeaderDefinition } from '../../../adf-schema';

export const tableHeader =
  (attrs?: CellAttributes) =>
  (...content: TableHeaderDefinition['content']): TableHeaderDefinition => ({
    type: 'tableHeader',
    attrs,
    content: content,
  });
