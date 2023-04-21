import { CreateNosPluginType } from '../types';
import { withResetInsertType } from './with-reset-insert-type';

export const useResetInsertTypePlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withResetInsertType,
  };
};
