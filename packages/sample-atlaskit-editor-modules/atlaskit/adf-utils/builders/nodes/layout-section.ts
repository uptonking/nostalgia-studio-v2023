import {
  LayoutColumnDefinition,
  LayoutSectionDefinition,
} from '../../../adf-schema';

export const layoutSection =
  () =>
  (content: Array<LayoutColumnDefinition>): LayoutSectionDefinition => ({
    type: 'layoutSection',
    content,
  });
