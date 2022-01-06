import { PlaceholderDefinition } from '../../../adf-schema';

export const placeholder = (
  attrs: PlaceholderDefinition['attrs'],
): PlaceholderDefinition => ({
  type: 'placeholder',
  attrs,
});
