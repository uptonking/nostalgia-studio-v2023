export type ItemPosition = 'absolute' | 'sticky';

export interface ItemStyle {
  position: ItemPosition;
  top?: number;
  left: number;
  width: string | number;
  height?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  zIndex?: number;
}

export interface ItemInfo {
  index: number;
  style: ItemStyle;
}

export interface RenderedRows {
  startIndex: number;
  stopIndex: number;
}
