import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';

import { autoformatRules } from '../../plugins/autoformat/autoformat-rules';
import useAutoformatPlugin
  from '../../plugins/autoformat/use-autoformat-plugin';
import useBlockquotePlugin
  from '../../plugins/blockquote/use-blockquote-plugin';
import useDividerPlugin from '../../plugins/divider/use-divider-plugin';
import useExitBreakPlugin from '../../plugins/exit-break/use-exit-break-plugin';
import useHeadingPlugin from '../../plugins/heading/use-heading-plugin';
import useImagePlugin from '../../plugins/image/use-image-plugin';
import useLinkPlugin from '../../plugins/link/use-link-plugin';
import useListPlugin from '../../plugins/list/use-list-plugin';
import useMarksPlugin from '../../plugins/marks/use-marks-plugin';
import useNodeIdPlugin from '../../plugins/node-id/use-node-id-plugin';
import useResetTypePlugin from '../../plugins/reset-type/use-reset-type-plugin';
import useDeserializePlugin
  from '../../plugins/serialization/use-deserialize-plugin';
import useSerializePlugin
  from '../../plugins/serialization/use-serialize-plugin';
import useSoftBreakPlugin from '../../plugins/soft-break/useSoftBreakPlugin';
import useTrailingLinePlugin
  from '../../plugins/trailing-line/use-trailing-line-plugin';
import { SlatePlugin } from '../../plugins/types';
import useExtendedPlugin from '../../slate-extended/use-extended-plugin';
import { compareLevels } from '../utils';

export const usePlugins = (): SlatePlugin[] => {
  const plugins = [
    useTrailingLinePlugin({}),
    useResetTypePlugin({}),
    useSoftBreakPlugin({}),
    useExitBreakPlugin({}),
    useAutoformatPlugin({ rules: autoformatRules }),
    useListPlugin({}),
    useDividerPlugin({}),
    useHeadingPlugin({}),
    useLinkPlugin({}),
    useBlockquotePlugin({}),
    useImagePlugin({}),
    useSerializePlugin({}),
    useDeserializePlugin({}),
    useMarksPlugin({}),
    useExtendedPlugin({
      compareLevels,
    }),
    useNodeIdPlugin({}),
    {
      withOverrides: withHistory,
    },
    {
      withOverrides: withReact,
    },
  ];

  return plugins;
};

