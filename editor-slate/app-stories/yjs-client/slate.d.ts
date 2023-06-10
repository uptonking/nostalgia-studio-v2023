import { type RemoteCursorDecoratedRange } from '@slate-yjs/react';
import { type BaseRange } from 'slate';
import { type CursorData } from './types';

declare module 'slate' {
  interface CustomTypes {
    Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
  }
}
