import { type DIRECTIONS } from '../utils/constants';

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

export interface Position {
  col: HeaderIndex;
  row: HeaderIndex;
}

export type Dimension = 'COL' | 'ROW';

export type DIRECTION = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

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
