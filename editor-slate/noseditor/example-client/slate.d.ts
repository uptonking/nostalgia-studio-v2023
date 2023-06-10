import { BaseRange } from 'slate';

import { type YHistoryEditor, type YjsEditor } from '@slate-yjs/core';
import { RemoteCursorDecoratedRange } from '@slate-yjs/react';

import { type CustomEditor, type CustomElement, type CustomText } from '../src';
import { type CursorData, type SyncableEditor } from './types';

// declare module 'slate' {
//   interface CustomTypes {
//     Editor: SyncableEditor;
//     Element: CustomElement;
//     Text: CustomText;
//     Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
//   }
// }
