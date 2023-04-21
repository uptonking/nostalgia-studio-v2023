import { CreateNosPluginType } from '../types';
import { withTrailingLine } from './with-trailing-line';

export const useTrailingLinePlugin: CreateNosPluginType = () => {
  return {
    withOverrides: withTrailingLine,
  };
};
