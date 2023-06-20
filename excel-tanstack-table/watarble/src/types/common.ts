import { type DIRECTION } from '../utils/constants';

export type Alias = {} & {};

/** Unique identifier */
export type UID = string & Alias;

/** Col/row Index */
export type HeaderIndex = number & Alias;
export type ConsecutiveIndexes = HeaderIndex[];

export type ClientId = string;

export interface Client {
  id: ClientId;
  name: string;
  position?: ClientPosition;
}

export interface ClientPosition {
  sheetId: UID;
  col: HeaderIndex;
  row: HeaderIndex;
}

export interface HeaderDimensions {
  start: Pixel;
  size: Pixel;
  end: Pixel;
}

export interface HeaderData {
  size?: number;
  isHidden?: boolean;
}

export interface Position {
  col: HeaderIndex;
  row: HeaderIndex;
}

export type Dimension = 'COL' | 'ROW';

/** range defined by left-right-top-bottom */
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

export interface Range {
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

export type DirectionType = (typeof DIRECTION)[keyof typeof DIRECTION];

export type Mode = 'normal' | 'readonly';

/** any DOM pixel value */
export type Pixel = number & Alias;

export type Color = string & Alias;

export interface RGBA {
  a: number;
  r: number;
  g: number;
  b: number;
}

export interface Ref<T> {
  el: T | null;
}

export type CSSProperties<P extends string = string> = Record<
  P,
  string | undefined
>;

export interface Cloneable<T> {
  clone: (args?: Partial<T>) => T;
}

export type ChangeType = 'REMOVE' | 'RESIZE' | 'MOVE' | 'CHANGE' | 'NONE';
export type ApplyRangeChangeResult =
  | { changeType: Exclude<ChangeType, 'NONE'>; range: Range }
  | { changeType: 'NONE' };
export type ApplyRangeChange = (range: Range) => ApplyRangeChangeResult;

export type Increment = 1 | -1 | 0;

export interface SortOptions {
  /** If true sort the headers of the range along with the rest */
  sortHeaders?: boolean;
  /** If true treat empty cells as "0" instead of undefined */
  emptyCellAsZero?: boolean;
}

export type SortDirection = 'asc' | 'desc';
