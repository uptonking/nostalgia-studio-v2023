import { AutoformatRule } from '@udecode/plate-autoformat';

import { UseSlatePlugin } from '../types';
import { withAutoformat } from './with-autoformat';

type Options = { rules: AutoformatRule[] };

export const useAutoformatPlugin: UseSlatePlugin<Options> = ({ rules }) => {
  return {
    withOverrides: withAutoformat(rules),
  };
};

export default useAutoformatPlugin;
