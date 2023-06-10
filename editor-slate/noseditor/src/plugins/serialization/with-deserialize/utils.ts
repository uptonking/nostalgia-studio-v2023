import { type Descendant, type Editor, Element, Text } from 'slate';

import { ParagraphSpec } from '../../paragraph/utils';

const isInlineNode =
  (editor: Pick<Editor, 'isInline'>) => (node: Descendant) => {
    return Text.isText(node) || editor.isInline(node);
  };

/**
 * Normalize the descendants to a valid document fragment.
 */
export const normalizeDescendantsToDocumentFragment = (
  editor: Editor,
  { descendants }: { descendants: Descendant[] },
) => {
  const isInline = isInlineNode(editor);
  const ELEMENT_DEFAULT = ParagraphSpec;
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);
  const makeDefaultBlock = makeBlockLazy(
    defaultType,
  ) as unknown as () => Element;

  return normalize(descendants, isInline, makeDefaultBlock);
};

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = (editor: Editor, key: string) =>
  getPluginsByKey(editor)[key] ?? { key };

export const getPluginsByKey = (editor?: Editor): Record<string, any> => {
  const plugins = {};
  if (editor['pluginsByKey']) {
    return editor['pluginsByKey'] as Record<string, any>;
  }
  return plugins;
};

/**
 * Get plugin type option by plugin key.
 */
export const getPluginType = (editor: Editor, key: string): string =>
  getPlugin(editor, key).type ?? key ?? '';

const makeBlockLazy = (type: string) => () => ({
  type,
  children: [],
});

const hasDifferentChildNodes = (
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean,
): boolean => {
  return descendants.some((descendant, index, arr) => {
    const prevDescendant = arr[index - 1];
    if (index !== 0) {
      return isInline(descendant) !== isInline(prevDescendant);
    }
    return false;
  });
};

/**
 * Handles 3rd constraint: "Block nodes can only contain other blocks, or inline and text nodes."
 */
const normalizeDifferentNodeTypes = (
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean,
  makeDefaultBlock: () => Element,
): Descendant[] => {
  const hasDifferentNodes = hasDifferentChildNodes(descendants, isInline);

  const { fragment } = descendants.reduce(
    (memo, node) => {
      if (hasDifferentNodes && isInline(node)) {
        let block = memo.precedingBlock;
        if (!block) {
          block = makeDefaultBlock();
          memo.precedingBlock = block;
          memo.fragment.push(block);
        }
        block.children.push(node);
      } else {
        memo.fragment.push(node);
        memo.precedingBlock = null;
      }

      return memo;
    },
    {
      fragment: [] as Descendant[],
      precedingBlock: null as Element | null,
    },
  );

  return fragment;
};

/**
 * Handles 1st constraint: "All Element nodes must contain at least one Text descendant."
 */
const normalizeEmptyChildren = (descendants: Descendant[]): Descendant[] => {
  if (!descendants.length) {
    return [{ text: '' }];
  }
  return descendants;
};

const normalize = (
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean,
  makeDefaultBlock: () => Element,
) => {
  descendants = normalizeEmptyChildren(descendants);
  descendants = normalizeDifferentNodeTypes(
    descendants,
    isInline,
    makeDefaultBlock,
  );

  descendants = descendants.map((node) => {
    if (Element.isElement(node)) {
      return {
        ...node,
        children: normalize(node.children, isInline, makeDefaultBlock),
      };
    }
    return node;
  });

  return descendants;
};

export const createPluginFactory = (plugin) => {
  const overrideByKey = {};
  // overrideByKey[plugin.key] = undefined;

  return overridePluginsByKey({ ...plugin }, overrideByKey);
};

export const overridePluginsByKey = (plugin, overrideByKey = {}) => {
  plugin = Object.assign(plugin, overrideByKey);

  if (plugin.plugins) {
    // override plugin.plugins
    plugin.plugins = plugin.plugins.map((p) => createPluginFactory(p));
  }

  return plugin;
};
