import {
  AlignTextBoth as AlignTextBothIcon,
  AlignTextCenter as AlignTextCenterIcon,
  AlignTextLeft as AlignTextLeftIcon,
  AlignTextRight as AlignTextRightIcon,
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

type ActionButtonType = {
  type: 'button';
  icon: Icon;
  format?: TextFormats;
  action?: 'align' | 'link' | (typeof ListTypes)[keyof typeof ListTypes];
  title?: string;
};

type OptionItemType = {
  value: string;
  icon: Icon;
  text?: string;
  title?: string;
};

export type TextAlignValueType = 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'


type ActionDropdownType = {
  type: 'dropdown';
  action: 'align' | 'fontSize' | 'fontColor';
  icon?: Icon;
  title?: string;
  options: Array<{ value: TextAlignValueType } & Omit<OptionItemType, 'value'>>;
};

type ActionItemType = ActionButtonType | ActionDropdownType;

export type ToolbarConfigType = ActionItemType[];

export const toolbarConfig: ToolbarConfigType = [
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
    action: ListTypes.Bulleted,
    title: 'toggle bullet list',
  },
  {
    type: 'button',
    icon: ListOrderedIcon,
    action: ListTypes.Numbered,
    title: 'toggle ordered list',
  },
  {
    type: 'button',
    icon: ListCheckboxIcon,
    action: ListTypes.TodoList,
    title: 'toggle checkbox list',
  },
  {
    type: 'button',
    icon: LinkIcon,
    action: 'link',
    title: 'add link',
  },
  {
    type: 'dropdown',
    action: 'align',
    icon: LinkIcon,
    options: [
      {
        icon: AlignTextLeftIcon,
        value: 'alignLeft',
        text: 'Align Left',
        title: 'Align Left',
      },
      {
        icon: AlignTextCenterIcon,
        value: 'alignCenter',
        text: 'Align Center',
        title: 'Align Center',
      },
      {
        icon: AlignTextRightIcon,
        value: 'alignRight',
        text: 'Align Right',
        title: 'Align Right',
      },
      {
        icon: AlignTextBothIcon,
        value: 'alignJustify',
        text: 'Justify',
        title: 'Justify',
      },
    ],
  },
];
