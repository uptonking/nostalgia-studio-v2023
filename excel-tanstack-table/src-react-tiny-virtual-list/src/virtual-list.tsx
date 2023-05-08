import * as React from 'react';

import {
  DIRECTION,
  marginProp,
  oppositeMarginProp,
  positionProp,
  SCROLL_CHANGE_REASON,
  scrollProp,
  sizeProp,
} from './constants';
import {
  type ItemSizeGetter,
  SizeAndPositionManager,
} from './size-position-manager';
import type {
  ItemPosition,
  ItemStyle,
  VirtualListProps,
  VirtualListState,
} from './types';

interface StyleCache {
  [id: number]: ItemStyle;
}

const STYLE_WRAPPER: React.CSSProperties = {
  overflow: 'auto',
  willChange: 'transform',
  WebkitOverflowScrolling: 'touch',
};
const STYLE_INNER: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '100%',
};
const STYLE_ITEM: ItemStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
};
const STYLE_STICKY_ITEM: ItemStyle = {
  ...STYLE_ITEM,
  position: 'sticky' as ItemPosition,
};

export class VirtualList extends React.PureComponent<
  VirtualListProps,
  VirtualListState
> {
  static defaultProps = {
    overscanCount: 3,
    scrollDirection: DIRECTION.VERTICAL,
    width: '100%',
  };

  sizePositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
    estimatedItemSize: this.getEstimatedItemSize(),
  });

  readonly state: VirtualListState = {
    offset:
      this.props.scrollOffset ||
      (this.props.scrollToIndex != null &&
        this.getOffsetForIndex(this.props.scrollToIndex)) ||
      0,
    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
  };

  private rootNode: HTMLElement;

  /** cache styles for all measured items */
  private styleCache: StyleCache = {};

  constructor(props: VirtualListProps) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const { scrollOffset, scrollToIndex } = this.props;
    this.rootNode.addEventListener('scroll', this.handleScroll, {
      passive: true,
    });

    if (scrollOffset != null) {
      this.scrollTo(scrollOffset);
    } else if (scrollToIndex != null) {
      this.scrollTo(this.getOffsetForIndex(scrollToIndex));
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: VirtualListProps) {
    const {
      estimatedItemSize,
      itemCount,
      itemSize,
      scrollOffset,
      scrollToAlignment,
      scrollToIndex,
    } = this.props;
    const scrollPropsHaveChanged =
      nextProps.scrollToIndex !== scrollToIndex ||
      nextProps.scrollToAlignment !== scrollToAlignment;
    const itemPropsHaveChanged =
      nextProps.itemCount !== itemCount ||
      nextProps.itemSize !== itemSize ||
      nextProps.estimatedItemSize !== estimatedItemSize;

    if (nextProps.itemSize !== itemSize) {
      this.sizePositionManager.updateConfig({
        itemSizeGetter: this.itemSizeGetter(nextProps.itemSize),
      });
    }

    if (
      nextProps.itemCount !== itemCount ||
      nextProps.estimatedItemSize !== estimatedItemSize
    ) {
      this.sizePositionManager.updateConfig({
        itemCount: nextProps.itemCount,
        estimatedItemSize: this.getEstimatedItemSize(nextProps),
      });
    }

    if (itemPropsHaveChanged) {
      this.recomputeSizes();
    }

    if (nextProps.scrollOffset !== scrollOffset) {
      this.setState({
        offset: nextProps.scrollOffset || 0,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
      });
      if (typeof nextProps.onScroll === 'function') {
        nextProps.onScroll(nextProps.scrollOffset || 0);
      }
    } else if (
      typeof nextProps.scrollToIndex === 'number' &&
      (scrollPropsHaveChanged || itemPropsHaveChanged)
    ) {
      const offset = this.getOffsetForIndex(
        nextProps.scrollToIndex,
        nextProps.scrollToAlignment,
        nextProps.itemCount,
      );
      this.setState({
        offset,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
      });
      if (typeof nextProps.onScroll === 'function') {
        nextProps.onScroll(offset);
      }
    }
  }

  componentDidUpdate(_: VirtualListProps, prevState: VirtualListState) {
    const { offset, scrollChangeReason } = this.state;

    if (
      prevState.offset !== offset &&
      scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED
    ) {
      this.scrollTo(offset);
    }
  }

  componentWillUnmount() {
    this.rootNode.removeEventListener('scroll', this.handleScroll);
  }

  itemSizeGetter(itemSize: VirtualListProps['itemSize']): ItemSizeGetter {
    return (index: number) => {
      if (typeof itemSize === 'function') {
        return itemSize(index);
      }
      return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    };
  }

  /** set `scrollTop/scrollLeft` */
  scrollTo(value: number) {
    const { scrollDirection = DIRECTION.VERTICAL } = this.props;
    this.rootNode[scrollProp[scrollDirection]] = value;
  }

  getOffsetForIndex(
    index: number,
    scrollToAlignment = this.props.scrollToAlignment,
    itemCount: number = this.props.itemCount,
  ): number {
    const { scrollDirection = DIRECTION.VERTICAL } = this.props;

    if (index < 0 || index >= itemCount) {
      index = 0;
    }

    return this.sizePositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: this.props[sizeProp[scrollDirection]],
      currentOffset: (this.state && this.state.offset) || 0,
      targetIndex: index,
    });
  }

  /**
   * force recomputes the item sizes after the specified index
   * - VirtualList has no way of knowing when its underlying data has changed, since it only receives a itemSize property.
   */
  recomputeSizes(startIndex = 0) {
    this.styleCache = {};
    this.sizePositionManager.resetItem(startIndex);
  }

  render() {
    const {
      estimatedItemSize,
      height,
      overscanCount = 3,
      renderItem,
      itemCount,
      itemSize,
      onItemsRendered,
      onScroll,
      scrollDirection = DIRECTION.VERTICAL,
      scrollOffset,
      scrollToIndex,
      scrollToAlignment,
      stickyIndices,
      style,
      width,
      ...props
    } = this.props;
    const { offset } = this.state;
    const { start, stop } = this.sizePositionManager.getVisibleRange({
      containerSize: this.props[sizeProp[scrollDirection]] || 0,
      offset,
      overscanCount,
    });
    const wrapperStyle = { ...STYLE_WRAPPER, ...style, height, width };
    const innerStyle = {
      ...STYLE_INNER,
      [sizeProp[scrollDirection]]: this.sizePositionManager.getTotalSize(),
    };

    const items: React.ReactNode[] = [];
    if (stickyIndices != null && stickyIndices.length !== 0) {
      stickyIndices.forEach((index: number) =>
        items.push(
          renderItem({
            index,
            style: this.getStyle(index, true),
          }),
        ),
      );
      if (scrollDirection === DIRECTION.HORIZONTAL) {
        innerStyle.display = 'flex';
      }
    }

    if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
      for (let index = start; index <= stop; index++) {
        if (stickyIndices != null && stickyIndices.includes(index)) {
          continue;
        }
        items.push(
          renderItem({
            index,
            style: this.getStyle(index, false),
          }),
        );
      }

      if (typeof onItemsRendered === 'function') {
        onItemsRendered({
          startIndex: start,
          stopIndex: stop,
        });
      }
    }

    return (
      <div ref={this.setRef} {...props} style={wrapperStyle}>
        <div style={innerStyle}>{items}</div>
      </div>
    );
  }

  private setRef = (node: HTMLDivElement): void => {
    this.rootNode = node;
  };

  /** update scroll offset state */
  private handleScroll = (event: Event) => {
    const { onScroll } = this.props;
    const offset = this.getNodeOffset();

    if (
      offset < 0 ||
      this.state.offset === offset ||
      event.target !== this.rootNode
    ) {
      return;
    }

    this.setState({
      offset,
      scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED,
    });

    if (typeof onScroll === 'function') {
      onScroll(offset, event as UIEvent);
    }
  };

  private getNodeOffset(): number {
    const { scrollDirection = DIRECTION.VERTICAL } = this.props;
    return this.rootNode[scrollProp[scrollDirection]];
  }

  private getEstimatedItemSize(props = this.props) {
    return (
      props.estimatedItemSize ||
      (typeof props.itemSize === 'number' && props.itemSize) ||
      50
    );
  }

  /** get item style from cache */
  private getStyle(index: number, sticky: boolean) {
    const style = this.styleCache[index];
    if (style) {
      return style;
    }

    const { scrollDirection = DIRECTION.VERTICAL } = this.props;
    const { size, offset } =
      this.sizePositionManager.getSizeAndPositionForIndex(index);

    return (this.styleCache[index] = sticky
      ? {
          ...STYLE_STICKY_ITEM,
          [sizeProp[scrollDirection]]: size,
          [marginProp[scrollDirection]]: offset,
          [oppositeMarginProp[scrollDirection]]: -(offset + size),
          zIndex: 1,
        }
      : {
          ...STYLE_ITEM,
          [sizeProp[scrollDirection]]: size,
          [positionProp[scrollDirection]]: offset,
        });
  }
}

export default VirtualList;
