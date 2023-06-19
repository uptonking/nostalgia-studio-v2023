import {
  type Alias,
  type Cloneable,
  type Color,
  type HeaderIndex,
  type Position,
  type UID,
} from './common';

export interface Zone {
  left: HeaderIndex;
  right: HeaderIndex;
  top: HeaderIndex;
  bottom: HeaderIndex;
}

export interface AnchorZone {
  zone: Zone;
  cell: Position;
}

export interface ZoneDimension {
  numberOfRows: HeaderIndex;
  numberOfCols: HeaderIndex;
}

export interface Selection {
  anchor: AnchorZone;
  zones: Zone[];
}

export type SelectionDirection = 'up' | 'down' | 'left' | 'right';

export type SelectionStep = number | 'end';

export interface RangePart {
  readonly colFixed: boolean;
  readonly rowFixed: boolean;
}

export interface Range extends Cloneable<Range> {
  readonly zone: Readonly<Zone>;
  readonly parts: readonly RangePart[];
  readonly invalidXc?: string;
  /** true if the user provided the range with the sheet name */
  readonly prefixSheet: boolean;
  /** the name of any sheet that is invalid */
  readonly invalidSheetName?: string;
  /** the sheet on which the range is defined */
  readonly sheetId: UID;
}

export interface RangeData {
  // _zone: Zone | UnboundedZone;
  _zone: Zone;
  _sheetId: UID;
}

export type Format = string & Alias;

export type FormattedValue = string & Alias;

export interface Style {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  // align?: Align;
  // wrapping?: Wrapping;
  // verticalAlign?: VerticalAlign;
  fillColor?: Color;
  textColor?: Color;
  fontSize?: number; // in pt, not in px!
}

export interface HeaderData {
  size?: number;
  isHidden?: boolean;
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
  // conditionalFormats: ConditionalFormat[];
  // filterTables: FilterTableData[];
  areGridLinesVisible?: boolean;
  isVisible: boolean;
  // panes?: PaneDivision;
}

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

export interface Row {
  cells: Record<number, UID | undefined>; // number is a column index
}

export interface CellData {
  content?: string;
  style?: number;
  border?: number;
  format?: number;
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
  // readonly compiledFormula: CompiledFormula;
  readonly dependencies: Range[];
}

export type Cell = LiteralCell | FormulaCell;

export type CellValue = string | number | boolean;
