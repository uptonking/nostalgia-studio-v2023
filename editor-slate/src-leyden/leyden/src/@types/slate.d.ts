import { type LeydenEditor } from '../interfaces/LeydenEditor';
import { type LeydenElement } from '../interfaces/Element';
import { type LeydenText } from '../interfaces/Text';

declare module 'slate' {
  interface CustomTypes {
    Editor: LeydenEditor;
    Element: LeydenElement;
    Text: LeydenText;
  }
}
