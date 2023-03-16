import { UseSlatePlugin } from '../types';
import { withNodeId } from './with-node-id';

export const useNodeIdPlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withNodeId,
  };
};

export default useNodeIdPlugin;
