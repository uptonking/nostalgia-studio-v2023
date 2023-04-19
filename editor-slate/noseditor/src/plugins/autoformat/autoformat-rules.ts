import { Editor } from 'slate';

import { BlockquoteSpec } from '../blockquote/utils';
import { Heading1Spec, Heading2Spec, Heading3Spec } from '../heading/utils';
import { toggleList } from '../list/commands';
import { ListItemSpec, ListVariants } from '../list/utils';
import type { AutoformatRule } from './types';

export const defaultAutoformatRules: AutoformatRule[] = [
  {
    mode: 'block',
    type: Heading1Spec,
    match: '# ',
  },
  {
    mode: 'block',
    type: Heading2Spec,
    match: '## ',
  },
  {
    mode: 'block',
    type: Heading3Spec,
    match: '### ',
  },
  {
    mode: 'block',
    type: BlockquoteSpec,
    match: ['> ','》 '],
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['* ', '- '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListVariants.Bulleted });
    },
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['1. ', '1) '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListVariants.Numbered });
    },
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['[] ', '【】 '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListVariants.Checkbox });
    },
  },
];
