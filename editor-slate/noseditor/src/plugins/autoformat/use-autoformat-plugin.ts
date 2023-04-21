import type { CreateNosPluginType } from '../types';
import { defaultAutoformatRules } from './autoformat-rules';
import type { AutoformatRule } from './types';
import { withAutoformat } from './with-autoformat';

type autofromatOptions = { rules: AutoformatRule[] };

export const useAutoformatPlugin: CreateNosPluginType<autofromatOptions> = (
  { rules = defaultAutoformatRules } = {} as autofromatOptions,
) => {
  return {
    withOverrides: withAutoformat(rules),
  };
};
