import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

import {
  useAutoformatPlugin,
  useBlockquotePlugin,
  useDeserializePlugin,
  useDividerPlugin,
  useDraggableCollapsiblePlugin,
  useExitBreakPlugin,
  useHeadingPlugin,
  useImagePlugin,
  useLinkPlugin,
  useListPlugin,
  useMarksPlugin,
  useNodeIdPlugin,
  useParagraphPlugin,
  useResetInsertTypePlugin,
  useSerializePlugin,
  useSoftBreakPlugin,
  useTablePlugin,
  useTrailingLinePlugin,
} from '../plugins';
import type { NosPlugin } from '../plugins/types';

/** collect configs of all plugins
 *
 * todo name not start with use
 */
export const usePlugins = (): NosPlugin[] => {
  const plugins = [
    useTrailingLinePlugin(),
    useResetInsertTypePlugin(),
    useSoftBreakPlugin(),
    useExitBreakPlugin(),
    useAutoformatPlugin(),
    useTablePlugin(),
    useImagePlugin(),
    useListPlugin(),
    useLinkPlugin(),
    useBlockquotePlugin(),
    useDividerPlugin(),
    useHeadingPlugin(),
    useParagraphPlugin(),
    useSerializePlugin(),
    useDeserializePlugin(),
    useMarksPlugin(),
    useDraggableCollapsiblePlugin(),
    useNodeIdPlugin(),
    {
      withOverrides: withHistory,
    },
    {
      withOverrides: withReact,
    },
  ];

  return plugins;
};
