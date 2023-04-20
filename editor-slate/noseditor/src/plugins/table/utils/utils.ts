import { Element } from 'slate';

import { createParagraphElement } from '../../paragraph/utils';
import type { TableCellElement, TableElement, TableRowElement } from '../types';

export const TableSpec = 'table';
export const TableRowSpec = 'tableRow';
export const TableCellSpec = 'tableCell';

export const isTableElement = (value: any): value is TableElement => {
  return Element.isElementType<TableElement>(value, TableSpec);
};

export const isTableRowElement = (value: any): value is TableRowElement => {
  return Element.isElementType<TableRowElement>(value, TableRowSpec);
};

export const isTableCellElement = (value: any): value is TableCellElement => {
  return Element.isElementType<TableCellElement>(value, TableCellSpec);
};

/**
 * create cell node for model
 */
export function createCellElement(value?: string): TableCellElement {
  return {
    type: TableCellSpec,
    children: [createParagraphElement()],
  };
}

/**
 * create row node for model
 */
export function createRowElement(
  children: TableCellElement[],
): TableRowElement {
  return {
    type: TableRowSpec,
    children,
  };
}

/**
 * create table node for model
 */
export function createTableElement(children: TableRowElement[]): TableElement {
  return {
    type: TableSpec,
    children,
  };
}
