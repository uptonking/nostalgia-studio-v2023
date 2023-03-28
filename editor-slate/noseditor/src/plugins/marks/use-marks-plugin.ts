import type { UseNosPlugin } from '../types';
import * as handlers from './handlers';
import { renderLeaf } from './render-leaf';

export const useMarksPlugin: UseNosPlugin = () => {
  return {
    handlers,
    renderLeaf,
  };
};
