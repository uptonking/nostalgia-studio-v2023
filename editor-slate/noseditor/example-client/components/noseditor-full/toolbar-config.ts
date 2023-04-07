import {
  AlignTextBoth as AlignTextBothIcon,
  AlignTextCenter as AlignTextCenterIcon,
  AlignTextLeft as AlignTextLeftIcon,
  AlignTextRight as AlignTextRightIcon,
  Code as CodeIcon,
  CosmeticBrush as HighlightColorIcon,
  DownOne as TriangleDownIcon,
  Find as FindIcon,
  FontSizeTwo as FontSizeIcon,
  InsertTable as InsertTableIcon,
  Link as LinkIcon,
  ListCheckbox as ListCheckboxIcon,
  OrderedList as ListOrderedIcon,
  Pic as ImageIcon,
  Redo as RedoIcon,
  RightOne as TriangleRightIcon,
  Strikethrough as StrikethroughIcon,
  TextBold as BoldIcon,
  TextItalic as ItalicIcon,
  TextUnderline as UnderlineIcon,
  Undo as UndoIcon,
  Unlink as UnlinkIcon,
  UnorderedList as ListUnorderedIcon,
} from '@icon-park/react';
import type { Icon } from '@icon-park/react/lib/runtime';

import { ListTypes } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';

type ActionButtonType = {
  type: 'button';
  icon: Icon;
  format?: TextFormats;
  action?:
  | 'align'
  | 'link'
  | (typeof ListTypes)[keyof typeof ListTypes]
  | 'image'
  | 'table'
  | 'colorPicker'
  | 'undo'
  | 'redo'
  | 'find';
  title?: string;
};

type OptionItemType = {
  value: string;
  icon?: Icon;
  text?: string;
  title?: string;
};

export type TextAlignValueType =
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify';

type ActionDropdownType = {
  type: 'dropdown';
  action: 'align' | 'fontSize' | 'fontColor';
  icon?: Icon;
  title?: string;
  options: Array<
    { value: TextAlignValueType | string } & Omit<OptionItemType, 'value'>
  >;
};

type ActionItemType = ActionButtonType | ActionDropdownType;

export type ToolbarConfigType = ActionItemType[][];

export const defaultToolbarConfig: ToolbarConfigType = [
  [
    // todo undo/redo
    {
      type: 'button',
      icon: UndoIcon,
      action: 'undo',
      title: 'Undo',
    },
    {
      type: 'button',
      icon: RedoIcon,
      action: 'redo',
      title: 'Redo',
    },
    // todo paint-format
    // todo block-type
  ],
  [
    {
      type: 'dropdown',
      action: 'fontSize',
      icon: FontSizeIcon,
      options: [
        {
          icon: FontSizeIcon,
          value: '10px',
          text: '10',
          title: '10 px',
        },
        {
          icon: FontSizeIcon,
          value: '12px',
          text: '12',
          title: '12 px',
        },
        {
          icon: FontSizeIcon,
          value: '14px',
          text: '14',
          title: '14 px',
        },
        {
          icon: FontSizeIcon,
          value: '16px',
          text: '16',
          title: '16 px',
        },
        {
          icon: FontSizeIcon,
          value: '18px',
          text: '18',
          title: '18 px',
        },
        {
          icon: FontSizeIcon,
          value: '24px',
          text: '24',
          title: '24 px',
        },
        {
          icon: FontSizeIcon,
          value: '30px',
          text: '30',
          title: '30 px',
        },
        {
          icon: FontSizeIcon,
          value: '36px',
          text: '36',
          title: '36 px',
        },
      ],
    },
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
      icon: FontSizeIcon,
      action: 'colorPicker',
      format: 'color',
      title: 'Font Color',
    },
    {
      type: 'button',
      icon: HighlightColorIcon,
      action: 'colorPicker',
      format: 'bgColor',
      title: 'Highlight Color',
    },
  ],
  [
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
  ],
  [
    {
      type: 'button',
      icon: UnlinkIcon,
      action: 'link',
      title: 'Add Link',
    },
    // todo image
    // todo table
    {
      type: 'button',
      icon: ImageIcon,
      action: 'image',
      title: 'Insert Image',
    },
    {
      type: 'button',
      icon: InsertTableIcon,
      action: 'table',
      title: 'Insert Table',
    },
    // todo blockquote
    {
      type: 'button',
      icon: CodeIcon,
      format: 'code',
      title: 'toggle text as code',
    },
    // {
    //   type: 'button',
    //   icon: FindIcon,
    //   action: 'find',
    //   title: 'search in doc',
    // },
  ],
];
