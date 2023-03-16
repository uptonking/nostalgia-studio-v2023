import { UseSlatePlugin } from '../types';
import { withSerialize } from './with-serialize';

const useSerializePlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withSerialize,
  };
};

export default useSerializePlugin;
