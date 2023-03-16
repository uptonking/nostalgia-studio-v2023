import { useMemo } from 'react';

import { Editor } from 'slate';

import { SlatePlugin } from '../../plugins/types';
import { composeHandlers } from '../../utils/slate-plugin';

export const usePluginsHandlers = (editor: Editor, plugins: SlatePlugin[]) => {
  return useMemo(
    () =>
      composeHandlers(
        editor,
        plugins.filter((x) => x.handlers).map((x) => x.handlers!),
      ),
    [],
  );
};

export default usePluginsHandlers;
