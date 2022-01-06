import { PanelAttributes, PanelDefinition } from '../../../adf-schema';

export const panel =
  (attrs: PanelAttributes) =>
  (...content: PanelDefinition['content']): PanelDefinition => ({
    type: 'panel',
    attrs,
    content,
  });
