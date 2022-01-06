import { MentionAttributes, MentionDefinition } from '../../../adf-schema';

export const mention = (attrs: MentionAttributes): MentionDefinition => ({
  type: 'mention',
  attrs: { accessLevel: '', ...attrs },
});
