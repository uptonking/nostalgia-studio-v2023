import { ListItemArray, ListItemDefinition } from '../../../adf-schema';

export const listItem = (content: ListItemArray): ListItemDefinition => ({
  type: 'listItem',
  content,
});
