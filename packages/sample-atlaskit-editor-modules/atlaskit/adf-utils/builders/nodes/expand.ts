import { ExpandDefinition, NonNestableBlockContent } from '../../../adf-schema';

export const expand =
  (attrs: ExpandDefinition['attrs']) =>
  (...content: Array<NonNestableBlockContent>): ExpandDefinition => ({
    type: 'expand',
    attrs,
    content,
  });
