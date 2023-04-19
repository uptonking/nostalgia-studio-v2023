import type { UseNosPlugin } from '../types';
import { defaultAutoformatRules } from './autoformat-rules';
import type { AutoformatRule } from './types';
import { withAutoformat } from './with-autoformat';

type Options = { rules: AutoformatRule[] };

export const useAutoformatPlugin: UseNosPlugin<Options> = (
  { rules = defaultAutoformatRules } = {} as Options,
) => {
  return {
    withOverrides: withAutoformat(rules),
  };
};
