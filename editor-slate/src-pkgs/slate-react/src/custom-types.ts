import { type BaseRange, type BaseText } from 'slate';

import { type ReactEditor } from './plugin/react-editor';

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor;
    Text: BaseText & {
      placeholder?: string;
    };
    Range: BaseRange & {
      placeholder?: string;
    };
  }
}
