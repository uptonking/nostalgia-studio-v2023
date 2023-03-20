import { UseNosPlugin } from '../types';
import { withSerialize } from './with-serialize';

export const useSerializePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withSerialize,
  };
};

