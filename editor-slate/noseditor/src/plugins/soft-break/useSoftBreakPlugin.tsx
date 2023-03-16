import { UseSlatePlugin } from '../types';
import * as handlers from './handlers';

const useSoftBreakPlugin: UseSlatePlugin = () => {
  return {
    handlers,
  };
};

export default useSoftBreakPlugin;
