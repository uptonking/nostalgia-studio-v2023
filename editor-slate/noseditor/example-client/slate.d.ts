import { BaseRange } from 'slate';

import type { YHistoryEditor, YjsEditor } from '@slate-yjs/core';
import { RemoteCursorDecoratedRange } from '@slate-yjs/react';

import type { CustomEditor, CustomElement, CustomText } from '../src';
import type { CursorData, SyncableEditor } from './types';

// declare module 'slate' {
//   interface CustomTypes {
//     Editor: SyncableEditor;
//     Element: CustomElement;
//     Text: CustomText;
//     Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
//   }
// }
