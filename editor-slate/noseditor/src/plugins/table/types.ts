import ee from 'event-emitter';
import type { BaseEditor, Descendant, Element, Path } from 'slate';
import { ReactEditor } from 'slate-react';

import { TableCellSpec, TableRowSpec, TableSpec } from './utils/utils';

export type Direction = 'above' | 'below';

export type TableCellElement = {
  type: typeof TableCellSpec;
  header?: string;
  colSpan?: number;
  rowSpan?: number;
  children: Element[];
};

export type TableRowElement = {
  type: typeof TableRowSpec;
  children: TableCellElement[];
};

export type TableElement = {
  type: typeof TableSpec;
  children: TableRowElement[];
  originTable?: (number | number[])[][][];
};

/**
 * add event-emitter to table
 *
 * todo remove event-emitter
 */
export interface WithTableEditor extends BaseEditor {
  tableState: {
    showSelection: boolean;
    selection: Path[];
  };
  // 自定义事件
  on: (type: string, listener: ee.EventListener) => void;
  off: (type: string, listener: ee.EventListener) => void;
  once: (type: string, listener: ee.EventListener) => void;
  emit: (type: string, ...args: any[]) => void;
}
