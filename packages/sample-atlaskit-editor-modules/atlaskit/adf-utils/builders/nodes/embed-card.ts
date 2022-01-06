import { EmbedCardAttributes, EmbedCardDefinition } from '../../../adf-schema';

export const embedCard = (attrs: EmbedCardAttributes): EmbedCardDefinition => ({
  type: 'embedCard',
  attrs,
});
