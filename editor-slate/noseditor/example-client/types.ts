import { Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

import {
  type CursorEditor,
  type YHistoryEditor,
  type YjsEditor,
} from '@slate-yjs/core';

import { type CustomEditor, type CustomElement, type CustomText } from '../src';

export type CursorData = {
  name: string;
  color: string;
  bgColor: string;
};

export type SyncableEditor = CustomEditor &
  YjsEditor &
  YHistoryEditor &
  CursorEditor<CursorData>;
