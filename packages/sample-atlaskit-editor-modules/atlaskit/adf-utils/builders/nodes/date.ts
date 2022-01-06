import { DateDefinition } from '../../../adf-schema';

export const date = (
  attrs: DateDefinition['attrs'] = { timestamp: '' },
): DateDefinition => ({
  type: 'date',
  attrs,
});
