import { UseSlatePlugin } from '../types';
import * as handlers from './handlers';

export const useExitBreakPlugin: UseSlatePlugin = () => {
  return {
    handlers,
  };
};

export default useExitBreakPlugin;
