import { AutoformatRule } from '@udecode/plate-autoformat';

import { UseNosPlugin } from '../types';
import { withAutoformat } from './with-autoformat';

type Options = { rules: AutoformatRule[] };

export const useAutoformatPlugin: UseNosPlugin<Options> = ({ rules }) => {
  return {
    withOverrides: withAutoformat(rules),
  };
};

export default useAutoformatPlugin;
