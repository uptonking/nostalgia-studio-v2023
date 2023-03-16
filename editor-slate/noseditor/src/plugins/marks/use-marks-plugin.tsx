import { UseSlatePlugin } from '../types';
import * as handlers from './handlers';
import { renderLeaf } from './renderLeaf';

const useMarksPlugin: UseSlatePlugin = () => {
  return {
    handlers,
    renderLeaf,
  };
};

export default useMarksPlugin;
