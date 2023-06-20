import { type CellValueDataTypes } from '../utils/constants';
import {
  type Format,
  type HeaderData,
  type HeaderIndex,
  type Style,
  type UID,
} from './common';

export interface WorkbookData {
  version: number;
  sheets: SheetData[];
  styles: { [key: number]: Style };
  formats: { [key: number]: Format };
  // borders: { [key: number]: Border };
  entities: { [key: string]: { [key: string]: any } };
  revisionId: UID;
  uniqueFigureIds: boolean;
}

export interface Sheet {
  id: UID;
  name: string;
  numberOfCols: number;
  rows: Row[];
  areGridLinesVisible: boolean;
  isVisible: boolean;
  // panes: PaneDivision;
}

export interface SheetData {
  id: string;
  name: string;
  colNumber: number;
  rowNumber: number;
  cells: { [key: string]: CellData | undefined };
  merges: string[];
  // figures: FigureData<any>[];
  cols: { [key: number]: HeaderData };
  rows: { [key: number]: HeaderData };
  isVisible: boolean;
  areGridLinesVisible?: boolean;
  // conditionalFormats: ConditionalFormat[];
  // filterTables: FilterTableData[];
  // panes?: PaneDivision;
}

export interface Row {
  cells: Record<number, UID | undefined>; // number is a column index
}

export interface CellData {
  content?: string;
  style?: number;
  format?: number;
  border?: number;
}

export interface UpdateCellData {
  content?: string;
  style?: Style | null;
  format?: Format;
  formula?: string;
}

export interface CellPosition {
  col: HeaderIndex;
  row: HeaderIndex;
  sheetId: UID;
}

interface CellAttributes {
  readonly id: UID;
  /**
   * Raw cell content
   */
  readonly content: string;
  readonly style?: Style;
  readonly format?: Format;
}

export interface LiteralCell extends CellAttributes {
  readonly isFormula: false;
}

export interface FormulaCell extends CellAttributes {
  readonly isFormula: true;
  // readonly compiledFormula?: CompiledFormula;
  readonly compiledFormula?: any;
  readonly dependencies: Range[];
}

export type Cell = LiteralCell | FormulaCell;

export type CellValue = string | number | boolean;

export type CellValueType =
  (typeof CellValueDataTypes)[keyof typeof CellValueDataTypes];
