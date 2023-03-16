import { UseSlatePlugin } from '../types';
import { withTrailingLine } from './with-trailing-line';

const useTrailingLinePlugin: UseSlatePlugin = () => {
  return {
    withOverrides: withTrailingLine,
  };
};

export default useTrailingLinePlugin;
