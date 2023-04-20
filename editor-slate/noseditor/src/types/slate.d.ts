import type { BaseEditor } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';

import type { BlockquoteElement } from '../plugins/blockquote/types';
import type { DividerElement } from '../plugins/divider/types';
import type {
  DraggableCollapsibleEditor,
  HashedElement,
  IdentityElement,
} from '../plugins/draggable-collapsible-feature';
import type {
  Heading1Element,
  Heading2Element,
  Heading3Element,
} from '../plugins/heading/types';
import type { ImageElement } from '../plugins/image/types';
import type { LinkElementType } from '../plugins/link/types';
import type { ListItemElement } from '../plugins/list/types';
import type { FormattedText } from '../plugins/marks/types';
import type { ParagraphElement } from '../plugins/paragraph/types';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
  WithTableEditor,
} from '../plugins/table/types';

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
  | LinkElementType
  | BlockquoteElement
  | DividerElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export type CustomElement = EditorUIElement & IdentityElement & HashedElement;

export type CustomText = FormattedText;

// declare module 'slate' {
//   interface CustomTypes {
//     Editor: CustomEditor;
//     Element: CustomElement;
//     Text: CustomText;
//   }
// }
