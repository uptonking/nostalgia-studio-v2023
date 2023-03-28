import {
  Code as CodeIcon,
  DownOne as TriangleDownIcon,
  Link as LinkIcon,
  ListCheckbox as ListCheckboxIcon,
  OrderedList as ListOrderedIcon,
  RightOne as TriangleRightIcon,
  Strikethrough as StrikethroughIcon,
  TextBold as BoldIcon,
  TextItalic as ItalicIcon,
  TextUnderline as UnderlineIcon,
  UnorderedList as ListUnorderedIcon,
} from '@icon-park/react';
import type { Icon } from '@icon-park/react/lib/runtime';

import { ListTypes } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';

type ToolbarConfigType = {
  type: 'button' | 'dropdown' | 'listbox';
  icon: Icon;
  format?: TextFormats;
  list?: typeof ListTypes[keyof typeof ListTypes];
  link?: 'link';
  title: string;
};

export const toolbarConfig: ToolbarConfigType[] = [
  {
    type: 'button',
    icon: BoldIcon,
    format: 'bold',
    title: 'toggle bold',
  },
  {
    type: 'button',
    icon: ItalicIcon,
    format: 'italic',
    title: 'toggle italic',
  },
  {
    type: 'button',
    icon: UnderlineIcon,
    format: 'underline',
    title: 'toggle underline',
  },
  {
    type: 'button',
    icon: StrikethroughIcon,
    format: 'strikethrough',
    title: 'toggle strikethrough',
  },
  {
    type: 'button',
    icon: CodeIcon,
    format: 'code',
    title: 'toggle text as code',
  },
  {
    type: 'button',
    icon: ListUnorderedIcon,
    list: ListTypes.Bulleted,
    title: 'toggle bullet list',
  },
  {
    type: 'button',
    icon: ListOrderedIcon,
    list: ListTypes.Numbered,
    title: 'toggle ordered list',
  },
  {
    type: 'button',
    icon: ListCheckboxIcon,
    list: ListTypes.TodoList,
    title: 'toggle checkbox list',
  },
  {
    type: 'button',
    icon: LinkIcon,
    link: 'link',
    title: 'add link',
  },
];
