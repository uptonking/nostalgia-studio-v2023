import { MediaAttributes, MediaDefinition } from '../../../adf-schema';

export const media = (attrs: MediaAttributes): MediaDefinition => ({
  type: 'media',
  attrs,
});
