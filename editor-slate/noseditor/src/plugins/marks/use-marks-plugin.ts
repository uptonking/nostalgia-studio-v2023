import { type CreateNosPluginType } from '../types';
import * as handlers from './handlers';
import { renderLeaf } from './render-leaf';

export const useMarksPlugin: CreateNosPluginType = () => {
  return {
    handlers,
    renderLeaf,
  };
};
