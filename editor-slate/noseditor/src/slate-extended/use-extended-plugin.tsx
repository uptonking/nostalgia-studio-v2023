import { Editor } from 'slate';

import { compareLevels as compare } from '../components/utils';
import { UseNosPlugin } from '../plugins/types';
import { ExtendedEditor } from './extended-editor';
import { withExtended } from './with-extended';

type Options = {
  compareLevels?: (editor: Editor) => ExtendedEditor['compareLevels'];
};

export const useExtendedPlugin: UseNosPlugin<Options> = ({ compareLevels = compare } = {}) => {
  return {
    withOverrides: withExtended({ compareLevels }),
  };
};

export default useExtendedPlugin;
