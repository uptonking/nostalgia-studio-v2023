import { TextDefinition } from '../../../adf-schema';

export const text = (text: string): TextDefinition => ({
  type: 'text',
  text,
});
