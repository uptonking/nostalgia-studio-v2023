import { useMemo } from 'react';

import { Editor } from 'slate';

import { NosPlugin } from '../../plugins/types';
import { composePlugins } from '../../utils/slate-plugin';

/** reversely compose plugins with `withOverrides`-not-undefined
 *
 * todo name not start with use
 */
export const useEditor = (createEditor: () => Editor, plugins: NosPlugin[]) => {
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
