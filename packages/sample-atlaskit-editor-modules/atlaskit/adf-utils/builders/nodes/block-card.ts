import { BlockCardDefinition, CardAttributes } from '../../../adf-schema';

export const blockCard = (attrs: CardAttributes): BlockCardDefinition => ({
  type: 'blockCard',
  attrs,
});
