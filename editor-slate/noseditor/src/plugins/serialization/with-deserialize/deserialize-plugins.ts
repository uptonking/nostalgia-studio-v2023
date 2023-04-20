import { nanoid } from 'nanoid';

import { BlockquoteSpec } from '../../blockquote/utils';
import { DividerSpec } from '../../divider/utils';
import { Heading1Spec, Heading2Spec, Heading3Spec } from '../../heading/utils';
import { ImageSpec } from '../../image/utils';
import { LinkSpec } from '../../link/utils';
import { ListItemSpec } from '../../list/utils';
import { ParagraphSpec } from '../../paragraph/utils';
import { getListItemPropertiesFromDom } from '../utils';
import type { DeserializeHtml } from './types';
import { createPluginFactory } from './utils';

const rules: DeserializeHtml[] = [
  {
    isElement: true,
    getNode: () => ({ type: ParagraphSpec }),
    rules: [
      {
        validNodeName: ['P', 'H4', 'H5', 'H6'],
      },
    ],
  },
  {
    getNode: () => ({ type: Heading1Spec }),
    isElement: true,
    rules: [
      {
        validNodeName: 'H1',
      },
    ],
  },
  {
    getNode: () => ({ type: Heading2Spec }),
    isElement: true,
    rules: [
      {
        validNodeName: 'H2',
      },
    ],
  },
  {
    getNode: () => ({ type: Heading3Spec }),
    isElement: true,
    rules: [
      {
        validNodeName: 'H3',
      },
    ],
  },
  {
    getNode: (el) => ({ type: ImageSpec, url: el.getAttribute('src') }),
    isElement: true,
    rules: [
      {
        validNodeName: 'IMG',
      },
    ],
  },
  {
    getNode: (el) => ({ type: LinkSpec, url: el.getAttribute('href') }),
    isElement: true,
    rules: [
      {
        validNodeName: 'A',
      },
    ],
    query: (el) => {
      return Boolean(el.textContent) && el.textContent.trim() !== ''; // skip if link includes non text info (e.g. image)
    },
  },
  {
    getNode: () => ({ type: DividerSpec }),
    isElement: true,
    rules: [
      {
        validNodeName: 'HR',
      },
    ],
  },
  {
    getNode: () => ({ type: BlockquoteSpec }),
    isElement: true,
    rules: [
      {
        validNodeName: 'BLOCKQUOTE',
      },
    ],
  },
  {
    getNode: (el) => {
      const { listType, depth } = getListItemPropertiesFromDom(el);

      return {
        type: ListItemSpec,
        depth,
        listType,
      };
    },
    isElement: true,
    rules: [
      {
        validNodeName: ['LI'],
      },
    ],
  },
  {
    isLeaf: true,
    getNode: () => ({ bold: true }),
    rules: [
      { validNodeName: ['STRONG', 'B'] },
      {
        validStyle: {
          fontWeight: ['600', '700', 'bold'],
        },
      },
    ],
  },
  {
    isLeaf: true,
    getNode: () => ({ italic: true }),
    rules: [
      { validNodeName: ['EM', 'I'] },
      {
        validStyle: {
          fontStyle: 'italic',
        },
      },
    ],
  },
  {
    isLeaf: true,
    getNode: () => ({ code: true }),
    rules: [
      {
        validNodeName: ['CODE'],
      },
      {
        validStyle: {
          wordWrap: 'break-word',
        },
      },
    ],
  },
  {
    isLeaf: true,
    getNode: () => ({ underline: true }),
    rules: [
      {
        validNodeName: ['U'],
      },
      {
        validStyle: {
          textDecoration: ['underline'],
        },
      },
    ],
  },
];

export const deserializePlugins = rules.map((rule) =>
  createPluginFactory({
    key: nanoid(4),
    deserializeHtml: rule,
  }),
);

deserializePlugins.forEach((p) => {
  p.inject = {};
});
