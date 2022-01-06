import { BlockQuoteDefinition, ParagraphDefinition } from '../../../adf-schema';

export const blockQuote = (
  ...content: Array<ParagraphDefinition>
): BlockQuoteDefinition => ({
  type: 'blockquote',
  content,
});
