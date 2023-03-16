import { Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

import { CursorEditor, YHistoryEditor, YjsEditor } from '@slate-yjs/core';

export type CursorData = {
  name: string;
  color: string;
  bgColor: string;
};

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  text: string;
};

export type Paragraph = {
  type: 'paragraph';
  children: Descendant[];
};

export type InlineCode = {
  type: 'inline-code';
  children: Descendant[];
};

export type HeadingOne = {
  type: 'heading-one';
  children: Descendant[];
};

export type HeadingTwo = {
  type: 'heading-two';
  children: Descendant[];
};

export type BlockQuote = {
  type: 'block-quote';
  children: Descendant[];
};

export type CustomElement =
  | Paragraph
  | InlineCode
  | HeadingOne
  | HeadingTwo
  | BlockQuote;

export type SyncableEditor = ReactEditor &
  YjsEditor &
  YHistoryEditor &
  CursorEditor<CursorData>;

declare module 'slate' {
  interface CustomTypes {
    // Editor: SyncableEditor;
    // Element: CustomElement;
    // Text: CustomText;
  }
}
