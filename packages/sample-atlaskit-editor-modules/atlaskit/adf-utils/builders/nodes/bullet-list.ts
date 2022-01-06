import { BulletListDefinition, ListItemDefinition } from '../../../adf-schema';

export const bulletList = (
  ...content: Array<ListItemDefinition>
): BulletListDefinition => ({
  type: 'bulletList',
  content,
});
