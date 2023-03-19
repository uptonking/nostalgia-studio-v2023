import { AutoformatRule } from '@udecode/plate-autoformat';

import { UseNosPlugin } from '../types';
import { autoformatRules } from './autoformat-rules';
import { withAutoformat } from './with-autoformat';

type Options = { rules: AutoformatRule[] };

export const useAutoformatPlugin: UseNosPlugin<Options> = (
  { rules = autoformatRules } = {} as Options,
) => {
  return {
    withOverrides: withAutoformat(rules),
  };
};

export default useAutoformatPlugin;
