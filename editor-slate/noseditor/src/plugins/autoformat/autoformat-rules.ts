import { Editor } from 'slate';

import { AutoformatRule } from '@udecode/plate-autoformat';

import { BlockquoteType } from '../blockquote/types';
import { Heading1Spec, Heading2Spec, Heading3Spec } from '../heading/utils';
import { toggleList } from '../list/commands';
import { ListItemSpec, ListTypes } from '../list/utils';

export const autoformatRules: AutoformatRule[] = [
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
    type: BlockquoteType,
    match: '> ',
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['* ', '- '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListTypes.Bulleted });
    },
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['1. ', '1) '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListTypes.Numbered });
    },
  },
  {
    mode: 'block',
    type: ListItemSpec,
    match: ['[] ', 'x ', 'X '],
    format: (editor: Editor) => {
      toggleList(editor, { listType: ListTypes.TodoList });
    },
  },
];
