import {
  AlignmentAttributes,
  AlignmentMarkDefinition,
  HeadingDefinition,
  ParagraphDefinition,
} from '../../../adf-schema';
import { WithAppliedMark, WithMark } from '../types';
import { applyMark } from '../utils/apply-mark';

export const alignment =
  (attrs: AlignmentAttributes) => (maybeNode: WithMark | string) =>
    applyMark<AlignmentMarkDefinition>(
      { type: 'alignment', attrs },
      maybeNode,
    ) as WithAppliedMark<
      ParagraphDefinition | HeadingDefinition,
      AlignmentMarkDefinition
    >;
