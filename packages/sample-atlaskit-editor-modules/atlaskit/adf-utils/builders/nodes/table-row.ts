import {
  TableCellDefinition,
  TableHeaderDefinition,
  TableRowDefinition,
} from '../../../adf-schema';

export const tableRow = (
  content: Array<TableHeaderDefinition> | Array<TableCellDefinition>,
): TableRowDefinition => ({
  type: 'tableRow',
  content,
});
