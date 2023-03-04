import ee from 'event-emitter';
import { BaseEditor, Descendant, Element, Path } from 'slate';
import { ReactEditor } from 'slate-react';

export type TableCellElement = {
  type: 'tableCell';
  header?: string;
  colSpan?: number;
  rowSpan?: number;
  children: Element[];
};
export type TableRowElement = {
  type: 'tableRow';
  children: TableCellElement[];
};
export type TableElement = {
  type: 'table';
  originTable?: (number | number[])[][][];
  children: TableRowElement[];
};

type ParagraphElement = { type: 'paragraph'; children: Descendant[] };
type CustomElement =
  | ParagraphElement
  | TableElement
  | TableRowElement
  | TableCellElement;
type CustomText = { text: string; bold?: true };

export type ExtendedEditor = {
  tableState: {
    showSelection: boolean;
    selection: Path[];
  };
  // 自定义事件
  on: (type: string, listener: ee.EventListener) => void;
  off: (type: string, listener: ee.EventListener) => void;
  once: (type: string, listener: ee.EventListener) => void;
  emit: (type: string, ...args: any[]) => void;
};
export type CustomEditor = BaseEditor & ReactEditor & ExtendedEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    // Element: CustomElement;
    // Text: CustomText;
  }
}
