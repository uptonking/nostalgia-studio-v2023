import { BaseEditor } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

import { BlockquoteElement } from '../plugins/blockquote/types';
import { DividerElement } from '../plugins/divider/types';
import {
  Heading1Element,
  Heading2Element,
  Heading3Element,
} from '../plugins/heading/types';
import { ImageElement } from '../plugins/image/types';
import { LinkElement } from '../plugins/link/types';
import { ListItemElement } from '../plugins/list/types';
import { FormattedText } from '../plugins/marks/types';
import { ParagraphElement } from '../plugins/paragraph/types';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
  WithTableEditor,
} from '../plugins/table/types';
import { ExtendedEditor } from '../slate-extended/extended-editor';
import { HashedElement, IdentityElement } from '../slate-extended/types';

export type CustomEditor = Omit<
  BaseEditor & ReactEditor & HistoryEditor,
  'children'
> &
  ExtendedEditor &
  WithTableEditor;

export type EditorUIElement =
  | ParagraphElement
  | Heading1Element
  | Heading2Element
  | Heading3Element
  | ImageElement
  | LinkElement
  | BlockquoteElement
  | DividerElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export type CustomElement = EditorUIElement & IdentityElement & HashedElement;

export type CustomText = FormattedText;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
