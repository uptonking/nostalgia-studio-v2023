import { type BlockQuoteElement } from './basic-modules/src/modules/blockquote/custom-types';
import {
  type CodeElement,
  type PreElement,
} from './basic-modules/src/modules/code-block/custom-types';
import { type ColorText } from './basic-modules/src/modules/color/custom-types';
import { type DividerElement } from './basic-modules/src/modules/divider/custom-types';
import { type FontSizeAndFamilyText } from './basic-modules/src/modules/font-size-family/custom-types';
import {
  type Header1Element,
  type Header2Element,
  type Header3Element,
  type Header4Element,
  type Header5Element,
} from './basic-modules/src/modules/header/custom-types';
import { type ImageElement } from './basic-modules/src/modules/image/custom-types';
import { type IndentElement } from './basic-modules/src/modules/indent/custom-types';
import { type JustifyElement } from './basic-modules/src/modules/justify/custom-types';
import { type LineHeightElement } from './basic-modules/src/modules/line-height/custom-types';
import { type LinkElement } from './basic-modules/src/modules/link/custom-types';
import { type ParagraphElement } from './basic-modules/src/modules/paragraph/custom-types';
/**
 * @description 自定义扩展 slate 接口属性
 * @author wangfupeng
 */
import { type StyledText } from './basic-modules/src/modules/text-style/custom-types';
import { type TodoElement } from './basic-modules/src/modules/todo/custom-types';
import { type ListItemElement } from './list-module/src/module/custom-types';
// import { VideoElement } from './video-module/src/module/custom-types'
import {
  type TableCellElement,
  type TableElement,
  type TableRowElement,
} from './table-module/src/module/custom-types';

type PureText = {
  text: string;
};

type CustomText = PureText | StyledText | FontSizeAndFamilyText | ColorText;

type BaseElement = {
  type: string;
  children: Array<CustomElement | CustomText>;
};

type CustomElement =
  | BaseElement
  | LineHeightElement
  | JustifyElement
  | IndentElement
  | ParagraphElement
  | LinkElement
  | BlockQuoteElement
  | Header1Element
  | Header2Element
  | Header3Element
  | Header4Element
  | Header5Element
  | DividerElement
  | ImageElement
  | TodoElement
  | PreElement
  | CodeElement
  // | VideoElement
  | TableCellElement
  | TableRowElement
  | TableElement
  | ListItemElement;

declare module 'slate' {
  interface CustomTypes {
    // 扩展 Text
    Text: CustomText;

    // 扩展 Element
    Element: CustomElement;
  }
}
