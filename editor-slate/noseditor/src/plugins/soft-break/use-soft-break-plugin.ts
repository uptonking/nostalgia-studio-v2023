import { UseNosPlugin } from '../types';
import * as handlers from './handlers';

export const useSoftBreakPlugin: UseNosPlugin = () => {
  return {
    handlers,
  };
};

