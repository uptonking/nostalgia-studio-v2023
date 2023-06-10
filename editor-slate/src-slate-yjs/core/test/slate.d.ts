import { type BaseElement, type BaseText } from 'slate';

declare module 'slate' {
  interface CustomTypes {
    Element: BaseElement & Record<string, unknown>;
    Text: BaseText & Record<string, unknown>;
  }
}
