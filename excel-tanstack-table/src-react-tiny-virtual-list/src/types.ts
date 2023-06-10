import {
  type ALIGNMENT,
  type DIRECTION,
  type SCROLL_CHANGE_REASON,
} from './constants';
import { type ItemSize } from './size-position-manager';

export type ItemPosition = 'absolute' | 'sticky';

/** subset of CSSProperties */
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

export interface VirtualListProps {
  className?: string;
  /** Estimated size of a item in the direction being windowed. default 50.
   * - This value is used to calculated the estimated total size of a list before its items have all been measured. It is updated whenever new items are measured.
   */
  estimatedItemSize?: number;
  /** Width of List. This determines the number of rendered items when scrollDirection is 'horizontal'. */
  width?: number | string;
  /** Height of List. This determines the number of rendered items when scrollDirection is 'vertical'. */
  height: number | string;
  /** The number of items you want to render.
   * - but actual-rendered items number is height/itemSize + overscanCount
   */
  itemCount: number;
  /** Either a fixed height/width, an array containing the heights of all the items in your list,
   * or a function that returns the height of an item given its index */
  itemSize: ItemSize;
  /** Number of extra buffer items to render above/below the visible items. */
  overscanCount?: number;
  /** Can be used to control the scroll offset; Also useful for setting an initial scroll offset */
  scrollOffset?: number;
  /** Item index to scroll to (by forcefully scrolling if necessary) */
  scrollToIndex?: number;
  /** Used in combination with `scrollToIndex`, this prop controls the alignment of the scrolled to item.
   * - `auto` scrolls the least amount possible to ensure that the specified scrollToIndex item is fully visible.
   */
  scrollToAlignment?: ALIGNMENT;
  scrollDirection?: DIRECTION;
  /** An array of indexes to make certain items in the list sticky (position: sticky) */
  stickyIndices?: number[];
  style?: React.CSSProperties;
  /** Callback invoked with information about the slice of rows/columns that were just rendered. */
  onItemsRendered?({ startIndex, stopIndex }: RenderedRows): void;
  /** Callback invoked whenever the scroll offset changes within the inner scrollable region. */
  onScroll?(offset: number, event?: UIEvent): void;
  /** Responsible for rendering an item given it's index */
  renderItem(itemInfo: ItemInfo): React.ReactNode;
}

export interface VirtualListState {
  offset: number;
  scrollChangeReason: SCROLL_CHANGE_REASON;
}
