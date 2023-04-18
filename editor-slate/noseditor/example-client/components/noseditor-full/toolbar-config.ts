import {
  AlignTextBoth as AlignTextJustifyIcon,
  AlignTextCenter as AlignTextCenterIcon,
  AlignTextLeft as AlignTextLeftIcon,
  AlignTextRight as AlignTextRightIcon,
  Code as CodeIcon,
  CosmeticBrush as HighlightColorIcon,
  DownOne as TriangleDownIcon,
  Find as FindIcon,
  FontSizeTwo as FontSizeIcon,
  H1 as H1Icon,
  H2 as H2Icon,
  H3 as H3Icon,
  InsertTable as InsertTableIcon,
  LevelFourTitle as H4Icon,
  LinkTwo as LinkIcon,
  List as ListCheckboxIcon,
  ListOne as ListUnorderedIcon,
  OrderedList as ListOrderedIcon,
  Pic as ImageIcon,
  Quote as BlockQuoteIcon,
  Redo as RedoIcon,
  RightOne as TriangleRightIcon,
  Strikethrough as StrikethroughIcon,
  Text as TextIcon,
  TextBold as BoldIcon,
  TextItalic as ItalicIcon,
  TextUnderline as UnderlineIcon,
  Undo as UndoIcon,
  Unlink as UnlinkIcon,
  Upload as UploadIcon,
} from '@icon-park/react';
import type { Icon } from '@icon-park/react/lib/runtime';

import { ListVariants } from '../../../src/plugins/list/utils';
import type { TextFormats } from '../../../src/plugins/marks/types';

export type ActionButtonType = {
  type: 'button';
  icon: Icon;
  format?: TextFormats;
  action?:
    | 'align'
    | 'link'
    | (typeof ListVariants)[keyof typeof ListVariants]
    | 'image'
    | 'table'
    | 'blockquote'
    | 'colorPicker'
    | 'undo'
    | 'redo'
    | 'find';
  title?: string;
  actions?: {
    type: string;
    text?: string;
    icon?: Icon;
    callback?: (...args: any[]) => any;
  }[];
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
  action: 'align' | 'fontSize' | 'blockTypes';
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
    {
      type: 'dropdown',
      action: 'blockTypes',
      icon: TextIcon,
      options: [
        {
          icon: TextIcon,
          value: 'p',
          text: 'Normal Text',
          title: 'Normal Text',
        },
        {
          icon: H1Icon,
          value: 'h1',
          text: 'Heading 1',
          title: 'Heading 1',
        },
        {
          icon: H2Icon,
          value: 'h2',
          text: 'Heading 2',
          title: 'Heading 2',
        },
        {
          icon: H3Icon,
          value: 'h3',
          text: 'Heading 3',
          title: 'Heading 3',
        },
      ],
    },
  ],
  [
    {
      type: 'dropdown',
      action: 'fontSize',
      icon: FontSizeIcon,
      options: [
        {
          value: '10px',
          text: '10',
          title: '10 px',
        },
        {
          value: '12px',
          text: '12',
          title: '12 px',
        },
        {
          value: '14px',
          text: '14',
          title: '14 px',
        },
        {
          value: '16px',
          text: '16',
          title: '16 px',
        },
        {
          value: '18px',
          text: '18',
          title: '18 px',
        },
        {
          value: '24px',
          text: '24',
          title: '24 px',
        },
        {
          value: '30px',
          text: '30',
          title: '30 px',
        },
        {
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
      title: 'Toggle Bold',
    },
    {
      type: 'button',
      icon: ItalicIcon,
      format: 'italic',
      title: 'Toggle Italic',
    },
    {
      type: 'button',
      icon: UnderlineIcon,
      format: 'underline',
      title: 'Toggle Underline',
    },
    {
      type: 'button',
      icon: StrikethroughIcon,
      format: 'strikethrough',
      title: 'Toggle Strikethrough',
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
      action: ListVariants.Bulleted,
      title: 'Toggle Bullet List',
    },
    {
      type: 'button',
      icon: ListOrderedIcon,
      action: ListVariants.Numbered,
      title: 'Toggle Ordered List',
    },
    {
      type: 'button',
      icon: ListCheckboxIcon,
      action: ListVariants.Checkbox,
      title: 'Toggle Checkbox List',
    },
    {
      type: 'dropdown',
      action: 'align',
      icon: AlignTextLeftIcon,
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
          icon: AlignTextJustifyIcon,
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
      icon: LinkIcon,
      action: 'link',
      title: 'Add Link',
    },
    // todo image
    {
      type: 'button',
      icon: ImageIcon,
      action: 'image',
      title: 'Insert Image',
      actions: [
        { type: 'uploadImage', text: 'Upload Image', icon: UploadIcon },
        { type: 'insertImageUrl', text: 'Insert Image By URL', icon: LinkIcon },
      ],
    },
    // todo table
    {
      type: 'button',
      icon: InsertTableIcon,
      action: 'table',
      title: 'Insert Table',
    },
    // todo blockquote
    {
      type: 'button',
      icon: BlockQuoteIcon,
      action: 'blockquote',
      title: 'Toggle Blockquote',
    },
    {
      type: 'button',
      icon: CodeIcon,
      format: 'code',
      title: 'Toggle text as code',
    },
    // {
    //   type: 'button',
    //   icon: FindIcon,
    //   action: 'find',
    //   title: 'search in doc',
    // },
  ],
];
