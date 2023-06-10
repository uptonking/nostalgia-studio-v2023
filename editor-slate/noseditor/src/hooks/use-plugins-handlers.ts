import { useMemo } from 'react';

import { type Editor } from 'slate';

import { type NosPlugin } from '../plugins/types';
import { composeHandlers } from '../utils/plugins-config-compose';

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
