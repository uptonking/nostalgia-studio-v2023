import { MediaDefinition, MediaGroupDefinition } from '../../../adf-schema';

export const mediaGroup = (
  ...content: Array<MediaDefinition>
): MediaGroupDefinition => ({
  type: 'mediaGroup',
  content,
});
