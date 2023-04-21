import type { CreateNosPluginType } from '../types';
import { withDeserialize } from './with-deserialize';

export const useDeserializePlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withDeserialize,
  };
};
