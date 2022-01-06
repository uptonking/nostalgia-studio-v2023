import {
  NestedExpandContent,
  NestedExpandDefinition,
} from '../../../adf-schema';

export const nestedExpand =
  (attrs: NestedExpandDefinition['attrs']) =>
  (...content: NestedExpandContent): NestedExpandDefinition => ({
    type: 'nestedExpand',
    attrs,
    content,
  });
