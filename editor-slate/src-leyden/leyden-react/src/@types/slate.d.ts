import { type LeydenElement, type LeydenText } from 'leyden';

import { type ReactEditor } from '../plugin/ReactEditor';

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: LeydenElement;
    Text: LeydenText;
  }
}
