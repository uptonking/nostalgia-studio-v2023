import { UseNosPlugin } from '../types';
import { withTrailingLine } from './with-trailing-line';

export const useTrailingLinePlugin: UseNosPlugin = () => {
  return {
    withOverrides: withTrailingLine,
  };
};
