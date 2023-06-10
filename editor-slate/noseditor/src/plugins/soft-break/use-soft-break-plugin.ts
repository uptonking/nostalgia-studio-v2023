import { type CreateNosPluginType } from '../types';
import * as handlers from './handlers';

export const useSoftBreakPlugin: CreateNosPluginType = () => {
  return {
    handlers,
  };
};
