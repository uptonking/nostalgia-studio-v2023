import { HeadingDefinition, Inline } from '../../../adf-schema';

export const heading =
  (attrs: HeadingDefinition['attrs']) =>
  (...content: Array<Inline>): HeadingDefinition => ({
    type: 'heading',
    attrs,
    content,
  });
