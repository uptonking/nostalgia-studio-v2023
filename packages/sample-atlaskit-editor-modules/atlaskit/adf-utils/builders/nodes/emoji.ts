import { EmojiAttributes, EmojiDefinition } from '../../../adf-schema';

export const emoji = (attrs: EmojiAttributes): EmojiDefinition => ({
  type: 'emoji',
  attrs,
});
