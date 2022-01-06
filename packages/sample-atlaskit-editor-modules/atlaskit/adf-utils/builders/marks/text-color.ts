import { TextColorAttributes, TextColorDefinition } from '../../../adf-schema';
import { WithMark } from '../types';
import { applyMark } from '../utils/apply-mark';

export const textColor =
  (attrs: TextColorAttributes) => (maybeNode: WithMark | string) =>
    applyMark<TextColorDefinition>({ type: 'textColor', attrs }, maybeNode);
