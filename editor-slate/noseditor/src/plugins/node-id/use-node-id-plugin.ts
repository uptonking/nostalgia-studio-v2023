import { UseNosPlugin } from '../types';
import { withNodeId } from './with-node-id';

export const useNodeIdPlugin: UseNosPlugin = () => {
  return {
    withOverrides: withNodeId,
  };
};

export default useNodeIdPlugin;
