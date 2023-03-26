import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

import { useAutoformatPlugin } from '../../plugins/autoformat/use-autoformat-plugin';
import { useBlockquotePlugin } from '../../plugins/blockquote/use-blockquote-plugin';
import { useDividerPlugin } from '../../plugins/divider/use-divider-plugin';
import { useExitBreakPlugin } from '../../plugins/exit-break/use-exit-break-plugin';
import { useHeadingPlugin } from '../../plugins/heading/use-heading-plugin';
import { useImagePlugin } from '../../plugins/image/use-image-plugin';
import { useLinkPlugin } from '../../plugins/link/use-link-plugin';
import { useListPlugin } from '../../plugins/list/use-list-plugin';
import { useMarksPlugin } from '../../plugins/marks/use-marks-plugin';
import { useNodeIdPlugin } from '../../plugins/node-id/use-node-id-plugin';
import { useParagraphPlugin } from '../../plugins/paragraph/use-paragraph-plugin';
import { useResetTypePlugin } from '../../plugins/reset-type/use-reset-type-plugin';
import { useDeserializePlugin } from '../../plugins/serialization/use-deserialize-plugin';
import { useSerializePlugin } from '../../plugins/serialization/use-serialize-plugin';
import { useSoftBreakPlugin } from '../../plugins/soft-break/use-soft-break-plugin';
import { useTablePlugin } from '../../plugins/table/use-table-plugin';
import { useTrailingLinePlugin } from '../../plugins/trailing-line/use-trailing-line-plugin';
import { NosPlugin } from '../../plugins/types';
import { useExtendedPlugin } from '../../slate-extended/use-extended-plugin';
import { compareLevels } from '../utils';

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
    useExtendedPlugin({
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
