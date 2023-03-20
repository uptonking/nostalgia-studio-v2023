import { useMemo } from 'react';

import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import * as Y from 'yjs';

import { withCursors, withYHistory, withYjs } from '@slate-yjs/core';

import {
  composePlugins,
  NosPlugin,
  useAutoformatPlugin,
  useBlockquotePlugin,
  useDeserializePlugin,
  useDividerPlugin,
  useExitBreakPlugin,
  useExtendedPlugin,
  useHeadingPlugin,
  useImagePlugin,
  useLinkPlugin,
  useListPlugin,
  useMarksPlugin,
  useNodeIdPlugin,
  useParagraphPlugin,
  useResetTypePlugin,
  useSerializePlugin,
  useSoftBreakPlugin,
  useTablePlugin,
  useTrailingLinePlugin,
} from '../../src';
import { withEnsureOneChildren } from '../plugins/withNormalize';
import { randomCursorData } from '../utils';

export const useSyncableEditor = ({ provider }) => {
  /** 👇🏻 to connect yjsType and slateEditor */
  const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

  const plugins = useSyncablePlugins({
    ySharedText: sharedType,
    yAwareness: provider.awareness,
    yCursorData: randomCursorData(),
  });

  const editor = useMemo(() => {
    return composePlugins(
      plugins.filter((x) => x.withOverrides).map((x) => x.withOverrides!),
      createEditor(),
    );
  }, [provider.awareness, provider.document]);

  return { editor, plugins };
};

/** collect configs of all plugins
 *
 */
export const useSyncablePlugins = ({
  ySharedText,
  yAutoConnect = false,
  yAwareness,
  yCursorData,
}): NosPlugin[] => {
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
    useExtendedPlugin(),
    useNodeIdPlugin(),
    {
      withOverrides: withEnsureOneChildren,
    },
    {
      withOverrides: withReact,
    },
    {
      withOverrides: withYHistory,
    },
    {
      withOverrides: {
        withEnhance: withCursors,
        withArgs: [yAwareness, { data: yCursorData }],
      },
    },
    {
      withOverrides: {
        withEnhance: withYjs,
        withArgs: [ySharedText, { autoConnect: yAutoConnect }],
      },
    },
  ];

  return plugins as unknown as NosPlugin[];
};
