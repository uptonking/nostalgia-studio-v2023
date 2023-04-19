import { UseNosPlugin } from '../types';
import { withResetInsertType } from './with-reset-insert-type';

export const useResetInsertTypePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withResetInsertType,
  };
};
