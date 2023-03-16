import { useMemo } from 'react';

import { Editor } from 'slate';

import { SlatePlugin } from '../../plugins/types';
import { composePlugins } from '../../utils/slate-plugin';

export const useEditor = (
  createEditor: () => Editor,
  plugins: SlatePlugin[],
) => {
  return useMemo(
    () =>
      composePlugins(
        plugins.filter((x) => x.withOverrides).map((x) => x.withOverrides!),
        createEditor(),
      ),
    [],
  );
};

export default useEditor;
