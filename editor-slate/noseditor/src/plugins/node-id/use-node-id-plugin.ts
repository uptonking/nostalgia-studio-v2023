import { type CreateNosPluginType } from '../types';
import { withNodeId } from './with-node-id';

export const useNodeIdPlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withNodeId,
  };
};
