import { UseNosPlugin } from '../types';
import { withDeserialize } from './with-deserialize';

export const useDeserializePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withDeserialize,
  };
};
