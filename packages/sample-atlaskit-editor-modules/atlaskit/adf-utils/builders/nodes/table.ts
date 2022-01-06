import { TableDefinition, TableRowDefinition } from '../../../adf-schema';

export const table = (
  ...content: Array<TableRowDefinition>
): TableDefinition => ({
  type: 'table',
  content,
});
