import { BaseRange } from 'slate';

import { RemoteCursorDecoratedRange } from '@slate-yjs/react';

import { CustomEditor, CustomElement, CustomText } from '../src/types/slate.d';
import { CursorData } from './types';

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    // Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
  }
}
