import type { CreateNosPluginType } from '../types';
import { withSerialize } from './with-serialize';

export const useSerializePlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withSerialize,
  };
};
