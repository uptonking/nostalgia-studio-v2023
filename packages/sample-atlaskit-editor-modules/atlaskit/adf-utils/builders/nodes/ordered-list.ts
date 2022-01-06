import { ListItemDefinition, OrderedListDefinition } from '../../../adf-schema';

export const orderedList =
  (attrs?: OrderedListDefinition['attrs']) =>
  (...content: Array<ListItemDefinition>): OrderedListDefinition => ({
    type: 'orderedList',
    attrs,
    content,
  });
