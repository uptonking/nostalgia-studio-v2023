import { HardBreakDefinition } from '../../../adf-schema';

export const hardBreak = (
  attrs?: HardBreakDefinition['attrs'],
): HardBreakDefinition => ({
  type: 'hardBreak',
  attrs,
});
