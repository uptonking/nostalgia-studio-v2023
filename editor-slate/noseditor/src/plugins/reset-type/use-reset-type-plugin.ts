import { UseNosPlugin } from '../types';
import { withResetType } from './with-reset-type';

export const useResetTypePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withResetType,
  };
};
