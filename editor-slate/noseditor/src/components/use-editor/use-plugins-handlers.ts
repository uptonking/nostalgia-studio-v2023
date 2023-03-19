import { useMemo } from 'react';

import { Editor } from 'slate';

import { NosPlugin } from '../../plugins/types';
import { composeHandlers } from '../../utils/slate-plugin';

/** compose plugins with `handlers`-not-undefined
 *
 * todo name not start with use
 */
export const usePluginsHandlers = (editor: Editor, plugins: NosPlugin[]) => {
  // console.log(';; plugins ', plugins)
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
