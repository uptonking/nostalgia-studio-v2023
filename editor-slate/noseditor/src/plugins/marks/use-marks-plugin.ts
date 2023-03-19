import { UseNosPlugin } from '../types';
import * as handlers from './handlers';
import { renderLeaf } from './renderLeaf';

export const useMarksPlugin: UseNosPlugin = () => {
  return {
    handlers,
    renderLeaf,
  };
};

export default useMarksPlugin;
