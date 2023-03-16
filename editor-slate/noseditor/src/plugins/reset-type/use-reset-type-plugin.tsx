import { UseSlatePlugin } from '../types';
import { withResetType } from './with-reset-type';

const useResetTypePlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withResetType,
  };
};

export default useResetTypePlugin;
