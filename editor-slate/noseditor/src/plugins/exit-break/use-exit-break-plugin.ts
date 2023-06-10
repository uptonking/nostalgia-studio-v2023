import { type CreateNosPluginType } from '../types';
import * as handlers from './handlers';

export const useExitBreakPlugin: CreateNosPluginType = () => {
  return {
    handlers,
  };
};
