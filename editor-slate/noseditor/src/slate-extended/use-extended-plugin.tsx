import { Editor } from 'slate';

import { UseNosPlugin } from '../plugins/types';
import { ExtendedEditor } from './extended-editor';
import { withExtended } from './with-extended';

type Options = {
  compareLevels: (editor: Editor) => ExtendedEditor['compareLevels'];
};

export const useExtendedPlugin: UseNosPlugin<Options> = (options) => {
  return {
    withOverrides: withExtended(options),
  };
};

export default useExtendedPlugin;
