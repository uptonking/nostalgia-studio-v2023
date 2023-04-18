import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

import { compareLevels } from '../components/utils';
import { useAutoformatPlugin } from '../plugins/autoformat/use-autoformat-plugin';
import { useBlockquotePlugin } from '../plugins/blockquote/use-blockquote-plugin';
import { useDividerPlugin } from '../plugins/divider/use-divider-plugin';
import { useDraggableCollapsiblePlugin } from '../plugins/draggable-collapsible-feature/use-draggable-collapsible-plugin';
import { useExitBreakPlugin } from '../plugins/exit-break/use-exit-break-plugin';
import { useHeadingPlugin } from '../plugins/heading/use-heading-plugin';
import { useImagePlugin } from '../plugins/image/use-image-plugin';
import { useLinkPlugin } from '../plugins/link/use-link-plugin';
import { useListPlugin } from '../plugins/list/use-list-plugin';
import { useMarksPlugin } from '../plugins/marks/use-marks-plugin';
import { useNodeIdPlugin } from '../plugins/node-id/use-node-id-plugin';
import { useParagraphPlugin } from '../plugins/paragraph/use-paragraph-plugin';
import { useResetTypePlugin } from '../plugins/reset-type/use-reset-type-plugin';
import { useDeserializePlugin } from '../plugins/serialization/use-deserialize-plugin';
import { useSerializePlugin } from '../plugins/serialization/use-serialize-plugin';
import { useSoftBreakPlugin } from '../plugins/soft-break/use-soft-break-plugin';
import { useTablePlugin } from '../plugins/table/use-table-plugin';
import { useTrailingLinePlugin } from '../plugins/trailing-line/use-trailing-line-plugin';
import type { NosPlugin } from '../plugins/types';

/** collect configs of all plugins
 *
 * todo name not start with use
 */
export const usePlugins = (): NosPlugin[] => {
  const plugins = [
    useTrailingLinePlugin(),
    useResetTypePlugin(),
    useSoftBreakPlugin(),
    useExitBreakPlugin(),
    useAutoformatPlugin(),
    useTablePlugin(),
    useListPlugin(),
    useDividerPlugin(),
    useHeadingPlugin(),
    useParagraphPlugin(),
    useLinkPlugin(),
    useBlockquotePlugin(),
    useImagePlugin(),
    useSerializePlugin(),
    useDeserializePlugin(),
    useMarksPlugin(),
    useDraggableCollapsiblePlugin({
      compareLevels,
    }),
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
