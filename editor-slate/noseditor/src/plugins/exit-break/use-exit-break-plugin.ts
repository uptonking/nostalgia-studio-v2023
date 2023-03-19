import { UseNosPlugin } from '../types';
import * as handlers from './handlers';

export const useExitBreakPlugin: UseNosPlugin = () => {
  return {
    handlers,
  };
};

export default useExitBreakPlugin;
