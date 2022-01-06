import {
  BodiedExtensionDefinition,
  DataConsumerAttributes,
  DataConsumerDefinition,
  ExtensionDefinition,
  InlineExtensionDefinition,
} from '../../../adf-schema';
import { WithAppliedMark } from '../types';
import { applyMark } from '../utils/apply-mark';

export const dataConsumer =
  (attrs: DataConsumerAttributes) =>
  (
    maybeNode:
      | ExtensionDefinition
      | BodiedExtensionDefinition
      | InlineExtensionDefinition,
  ) => {
    return applyMark<DataConsumerDefinition>(
      { type: 'dataConsumer', attrs },
      maybeNode,
    ) as WithAppliedMark<typeof maybeNode, DataConsumerDefinition>;
  };
