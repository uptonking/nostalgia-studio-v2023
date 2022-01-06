import { CardAttributes, InlineCardDefinition } from '../../../adf-schema';

export const inlineCard = (attrs: CardAttributes): InlineCardDefinition => ({
  type: 'inlineCard',
  attrs,
});
