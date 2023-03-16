import { Editor } from 'slate';

import { UseSlatePlugin } from '../plugins/types';
import { ExtendedEditor } from './extended-editor';
import { withExtended } from './with-extended';

type Options = {
  compareLevels: (editor: Editor) => ExtendedEditor['compareLevels'];
};
const useExtendedPlugin: UseSlatePlugin<Options> = (options) => {
  return {
    withOverrides: withExtended(options),
  };
};

export default useExtendedPlugin;
