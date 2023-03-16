import { UseSlatePlugin } from '../types';
import { withDeserialize } from './with-deserialize';

const useDeserializePlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withDeserialize,
  };
};

export default useDeserializePlugin;
