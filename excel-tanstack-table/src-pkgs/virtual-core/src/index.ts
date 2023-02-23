import { approxEqual, memo, notUndefined } from './utils';

export * from './utils';

//

type ScrollDirection = 'forward' | 'backward';

type ScrollAlignment = 'start' | 'center' | 'end' | 'auto';

type ScrollBehavior = 'auto' | 'smooth';

/**
 * Smooth scrolling is enabled by default, but may result in inaccurate landing positions when dynamically measuring elements (a common use case and configuration).
 * - If you plan to use smooth scrolling, it's suggested that you either estimate the size of your elements as close to their maximums as possible, or simply turn off dynamic measuring of elements.
 */
export interface ScrollToOptions {
  align?: ScrollAlignment;
  behavior?: ScrollBehavior;
}

type ScrollToOffsetOptions = ScrollToOptions;

type ScrollToIndexOptions = ScrollToOptions;

export interface Range {
  startIndex: number;
  endIndex: number;
  overscan: number;
  count: number;
}

type Key = number | string;

/** represents a single item returned by the virtualizer.
 * - It contains information you need to render the item in the cooredinate space within your virtualizer's scrollElement and other helpful properties/functions.
 */
export interface VirtualItem {
  /** The unique key for the item. By default this is the item index, but should be configured via the `getItemKey` Virtualizer option. */
  key: Key;
  /** The index of the item. */
  index: number;
  /** The starting pixel offset for the item.
   * - This is usually mapped to a css property or transform like `top/left` or `translateX/translateY`.
   */
  start: number;
  /** The ending pixel offset for the item. This value is not necessary for most layouts, but can be helpful so we've provided it anyway. */
  end: number;
  /** The size of the item. usually mapped to a css property like `width/height`.
   * - Before an item is measured via the `VirtualItem.measureElement` method, this will be the estimated size returned from your `estimateSize` virtualizer option.
   * - After an item is measured (if you choose to measure), this value will be the number(which by default is configured to measure elements with `getBoundingClientRect()`).
   */
  size: number;
}

interface Rect {
  width: number;
  height: number;
}

//

export const defaultKeyExtractor = (index: number) => index;

export const defaultRangeExtractor = (range: Range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);

  const arr = [];

  for (let i = start; i <= end; i++) {
    arr.push(i);
  }

  return arr;
};

/**
 * use `ResizeObserver`  to trigger `cb(element.getBoundingClientRect())`
 */
export const observeElementRect = <T extends Element>(
  instance: Virtualizer<T, any>,
  cb: (rect: Rect) => void,
) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }

  const handler = (rect: { width: number; height: number }) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };

  handler(element.getBoundingClientRect());

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      const box = entry.borderBoxSize[0];
      if (box) {
        handler({ width: box.inlineSize, height: box.blockSize });
        return;
      }
    }
    handler(element.getBoundingClientRect());
  });

  observer.observe(element, { box: 'border-box' });

  return () => {
    observer.unobserve(element);
  };
};

export const observeWindowRect = (
  instance: Virtualizer<Window, any>,
  cb: (rect: Rect) => void,
) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }

  const handler = () => {
    cb({ width: element.innerWidth, height: element.innerHeight });
  };
  handler();

  element.addEventListener('resize', handler, {
    passive: true,
  });

  return () => {
    element.removeEventListener('resize', handler);
  };
};

/** listen to element `scroll` event, and trigger `cb()` */
export const observeElementOffset = <T extends Element>(
  instance: Virtualizer<T, any>,
  cb: (offset: number) => void,
) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }

  const handler = () => {
    cb(element[instance.options.horizontal ? 'scrollLeft' : 'scrollTop']);
  };
  handler();

  element.addEventListener('scroll', handler, {
    passive: true,
  });

  return () => {
    element.removeEventListener('scroll', handler);
  };
};

/** listen to element `scroll` event */
export const observeWindowOffset = (
  instance: Virtualizer<Window, any>,
  cb: (offset: number) => void,
) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }

  const handler = () => {
    cb(element[instance.options.horizontal ? 'scrollX' : 'scrollY']);
  };
  handler();

  element.addEventListener('scroll', handler, {
    passive: true,
  });

  return () => {
    element.removeEventListener('scroll', handler);
  };
};

/**
 * by `getBoundingClientRect()`
 */
export const measureElement = <TItemElement extends Element>(
  element: TItemElement,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer<any, TItemElement>,
) => {
  if (entry) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(
        box[instance.options.horizontal ? 'inlineSize' : 'blockSize'],
      );
      return size;
    }
  }
  return Math.round(
    element.getBoundingClientRect()[
      instance.options.horizontal ? 'width' : 'height'
    ],
  );
};

export const windowScroll = <T extends Window>(
  offset: number,
  {
    adjustments = 0,
    behavior,
  }: { adjustments?: number; behavior?: ScrollBehavior },
  instance: Virtualizer<T, any>,
) => {
  const toOffset = offset + adjustments;

  instance.scrollElement?.scrollTo?.({
    [instance.options.horizontal ? 'left' : 'top']: toOffset,
    behavior,
  });
};

/** scroll to offset */
export const elementScroll = <T extends Element>(
  offset: number,
  {
    adjustments = 0,
    behavior,
  }: { adjustments?: number; behavior?: ScrollBehavior },
  instance: Virtualizer<T, any>,
) => {
  const toOffset = offset + adjustments;

  instance.scrollElement?.scrollTo?.({
    [instance.options.horizontal ? 'left' : 'top']: toOffset,
    behavior,
  });
};

export interface VirtualizerOptions<
  TScrollElement extends Element | Window,
  TItemElement extends Element,
> {
  /** Required. The total number of items to virtualize. */
  count: number;
  /** returns the scrollable element for the virtualizer. It may return undefined if the element is not available yet. */
  getScrollElement: () => TScrollElement | null;
  /** This function is passed the index of each item and should return the actual size
   * (or estimated size if you will be dynamically measuring items with `virtualItem.measureElement`) for each item.
   * - If you are dynamically measuring your elements, it's recommended to estimate the largest possible size (width/height, within comfort) of your items. This will ensure features like smooth-scrolling will have a better chance at working correctly.
   */
  estimateSize: (index: number) => number;
  /** Required from the framework adapter (but can be overridden)
   * - An optional function that if provided should implement the scrolling behavior for your scrollElement.
   * - It will be called with the offset to scroll to, a boolean indicating if the scrolling is allowed to be smoothed, and the virtualizer instance.
   */
  scrollToFn: (
    offset: number,
    options: { adjustments?: number; behavior?: ScrollBehavior },
    instance: Virtualizer<TScrollElement, TItemElement>,
  ) => void;
  /**
   * An optional function that if provided is called when the scrollElement changes and should implement the initial measurement and continuous monitoring of the scrollElement's Rect
   */
  observeElementRect: (
    instance: Virtualizer<TScrollElement, TItemElement>,
    cb: (rect: Rect) => void,
  ) => void | (() => void);
  /**
   * An optional function that if provided is called when the scrollElement changes and should implement the initial measurement and continuous monitoring of the scrollElement's scroll offset (a number).
   */
  observeElementOffset: (
    instance: Virtualizer<TScrollElement, TItemElement>,
    cb: (offset: number) => void,
  ) => void | (() => void);

  // Optional
  debug?: any;
  /** The initial Rect of the scrollElement. This is mostly useful if you need to run the virtualizer in an SSR environment, otherwise the initialRect will be calculated on mount by the observeElementRect implementation. */
  initialRect?: Rect;
  /** callback to fire when the virtualizer's internal state changes.
   * - for react-virtual, it will rerender the component where useVirtualizer is used
   */
  onChange?: (instance: Virtualizer<TScrollElement, TItemElement>) => void;
  /**
   * This optional function is called when the virtualizer needs to dynamically measure the size (width or height) of an item when virtualItem.measureElement is called.
   * - By default configured to measure elements with `getBoundingClientRect()`
   */
  measureElement?: (
    element: TItemElement,
    entry: ResizeObserverEntry | undefined,
    instance: Virtualizer<TScrollElement, TItemElement>,
  ) => number;
  /** The number of items to render above and below the visible area. */
  overscan?: number;
  horizontal?: boolean;
  /** The padding to apply to the start of the virtualizer in pixels. */
  paddingStart?: number;
  paddingEnd?: number;
  /** The padding to apply to the start of the virtualizer in pixels when scrolling to an element. */
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  /** The initial offset to apply to the virtualizer. This is usually only useful if you are rendering the virtualizer in a SSR environment. */
  initialOffset?: number;
  /** This function is passed the index of each item and should return a unique key for that item. The default functionality of this function is to return the index of the item */
  getItemKey?: (index: number) => Key;
  /** This function receives visible range indexes and should return array of indexes to render. This is useful if you need to add or remove items from the virtualizer manually regardless of the visible range, eg. rendering sticky items, headers, footers, etc. The default range extractor implementation will return the visible range indexes and is exported as defaultRangeExtractor. */
  rangeExtractor?: (range: Range) => number[];
  scrollMargin?: number;
  scrollingDelay?: number;
  indexAttribute?: string;
  initialMeasurementsCache?: VirtualItem[];
}

export class Virtualizer<
  TScrollElement extends Element | Window,
  TItemElement extends Element,
> {
  /** listeners to be trigged when cleanup */
  private unsubs: (void | (() => void))[] = [];
  /** This property is updated via your framework adapter and is read-only. */
  options!: Required<VirtualizerOptions<TScrollElement, TItemElement>>;
  /** scroll container for the virtualizer. This property is updated via your framework adapter and is read-only. */
  scrollElement: TScrollElement | null = null;
  isScrolling: boolean = false;
  private isScrollingTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private scrollToIndexTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /** use `estimateSize` for all elements */
  measurementsCache: VirtualItem[] = [];
  /** measured elements */
  measureElementCache = new Map<Key, TItemElement>();
  /** measured elements {key, measurementsCache.item.size} */
  private itemSizeCache = new Map<Key, number>();
  private pendingMeasuredCacheIndexes: number[] = [];
  private scrollRect: Rect;
  scrollOffset: number;
  scrollDirection: ScrollDirection | null = null;
  private scrollAdjustments: number = 0;

  /**
   * use ResizeObserver to trigger `_measureElement()`
   * todo rewrite to class.
   */
  private observer = (() => {
    let _ro: ResizeObserver | null = null;

    const get = () => {
      if (_ro) {
        return _ro;
      } else if (typeof ResizeObserver !== 'undefined') {
        return (_ro = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            this._measureElement(entry.target as TItemElement, entry);
          });
        }));
      } else {
        return null;
      }
    };

    return {
      disconnect: () => get()?.disconnect(),
      observe: (target: Element) =>
        get()?.observe(target, { box: 'border-box' }),
      unobserve: (target: Element) => get()?.unobserve(target),
    };
  })();

  range: { startIndex: number; endIndex: number } = {
    startIndex: 0,
    endIndex: 0,
  };

  constructor(opts: VirtualizerOptions<TScrollElement, TItemElement>) {
    this.setOptions(opts);
    this.scrollRect = this.options.initialRect;
    this.scrollOffset = this.options.initialOffset;
    this.measurementsCache = this.options.initialMeasurementsCache;
    this.measurementsCache.forEach((item) => {
      this.itemSizeCache.set(item.key, item.size);
    });

    this.maybeNotify();
  }

  setOptions = (opts: VirtualizerOptions<TScrollElement, TItemElement>) => {
    Object.entries(opts).forEach(([key, value]) => {
      if (typeof value === 'undefined') delete (opts as any)[key];
    });

    this.options = {
      debug: false,
      initialOffset: 0,
      overscan: 1,
      paddingStart: 0,
      paddingEnd: 0,
      scrollPaddingStart: 0,
      scrollPaddingEnd: 0,
      horizontal: false,
      getItemKey: defaultKeyExtractor,
      rangeExtractor: defaultRangeExtractor,
      onChange: () => {},
      measureElement,
      initialRect: { width: 0, height: 0 },
      scrollMargin: 0,
      scrollingDelay: 150,
      indexAttribute: 'data-index',
      initialMeasurementsCache: [],
      ...opts,
    };
  };

  /** trigger `this.options.onChange()`, useful to rerender view */
  private notify = () => {
    this.options.onChange?.(this);
  };

  /** trigger all unsubs-listeners before cleanup */
  private cleanup = () => {
    this.unsubs.filter(Boolean).forEach((d) => typeof d === 'function' && d());
    this.unsubs = [];
    this.scrollElement = null;
  };

  /** add listeners to all cached measured elements using `ResizeObserver` */
  _didMount = () => {
    this.measureElementCache.forEach(this.observer.observe);
    return () => {
      this.observer.disconnect();
      this.cleanup();
    };
  };

  /** only when `this.scrollElement` changed, unsubs-listeners will be registered  */
  _willUpdate = () => {
    const scrollElement = this.options.getScrollElement();

    if (this.scrollElement !== scrollElement) {
      this.cleanup();

      this.scrollElement = scrollElement;

      this._scrollToOffset(this.scrollOffset, {
        adjustments: undefined,
        behavior: undefined,
      });

      this.unsubs.push(
        this.options.observeElementRect(this, (rect) => {
          const prev = this.scrollRect;
          this.scrollRect = rect;
          if (
            this.options.horizontal
              ? rect.width !== prev.width
              : rect.height !== prev.height
          ) {
            this.maybeNotify();
          }
        }),
      );

      this.unsubs.push(
        this.options.observeElementOffset(this, (offset) => {
          this.scrollAdjustments = 0;

          if (this.scrollOffset === offset) {
            return;
          }

          if (this.isScrollingTimeoutId !== null) {
            clearTimeout(this.isScrollingTimeoutId);
            this.isScrollingTimeoutId = null;
          }

          this.isScrolling = true;
          this.scrollDirection =
            this.scrollOffset < offset ? 'forward' : 'backward';
          this.scrollOffset = offset;

          this.maybeNotify();

          this.isScrollingTimeoutId = setTimeout(() => {
            this.isScrollingTimeoutId = null;
            this.isScrolling = false;
            this.scrollDirection = null;

            this.maybeNotify();
          }, this.options.scrollingDelay);
        }),
      );
    }
  };

  /** return height or width as element size */
  private getSize = () => {
    return this.scrollRect[this.options.horizontal ? 'width' : 'height'];
  };

  /** iterate each item, and try to use `estimateSize` if not measured */
  private getMeasurements = memo(
    () => [
      this.options.count,
      this.options.paddingStart,
      this.options.scrollMargin,
      this.options.getItemKey,
      this.itemSizeCache,
    ],
    (count, paddingStart, scrollMargin, getItemKey, itemSizeCache) => {
      const min =
        this.pendingMeasuredCacheIndexes.length > 0
          ? Math.min(...this.pendingMeasuredCacheIndexes)
          : 0;
      this.pendingMeasuredCacheIndexes = [];

      const measurements = this.measurementsCache.slice(0, min);

      for (let i = min; i < count; i++) {
        const key = getItemKey(i);
        const measuredSize = itemSizeCache.get(key);
        const start = measurements[i - 1]
          ? measurements[i - 1]!.end
          : paddingStart + scrollMargin;
        const size =
          typeof measuredSize === 'number'
            ? measuredSize
            : this.options.estimateSize(i);
        const end = start + size;
        measurements[i] = { index: i, start, size, end, key };
      }

      this.measurementsCache = measurements;

      return measurements;
    },
    {
      key: process.env.NODE_ENV !== 'production' && 'getMeasurements',
      debug: () => this.options.debug,
    },
  );

  /**  calculate minimal range index */
  calculateRange = memo(
    () => [this.getMeasurements(), this.getSize(), this.scrollOffset],
    (measurements, outerSize, scrollOffset) => {
      return (this.range = calculateRangeIndex({
        measurements,
        outerSize,
        scrollOffset,
      }));
    },
    {
      key: process.env.NODE_ENV !== 'production' && 'calculateRange',
      debug: () => this.options.debug,
    },
  );

  /** trigger `this.options.onChange()` only when range index changes */
  private maybeNotify = memo(
    () => [...Object.values(this.calculateRange()), this.isScrolling],
    () => {
      this.notify();
    },
    {
      key: process.env.NODE_ENV !== 'production' && 'maybeNotify',
      debug: () => this.options.debug,
      initialDeps: [...Object.values(this.range), this.isScrolling],
    },
  );

  private getIndexes = memo(
    () => [
      this.options.rangeExtractor,
      this.calculateRange(),
      this.options.overscan,
      this.options.count,
    ],
    (rangeExtractor, range, overscan, count) => {
      return rangeExtractor({
        ...range,
        overscan,
        count,
      });
    },
    {
      key: process.env.NODE_ENV !== 'production' && 'getIndexes',
      debug: () => this.options.debug,
    },
  );

  indexFromElement = (node: TItemElement) => {
    const attributeName = this.options.indexAttribute;
    const indexStr = node.getAttribute(attributeName);

    if (!indexStr) {
      console.warn(
        `Missing attribute name '${attributeName}={index}' on measured element.`,
      );
      return -1;
    }

    return parseInt(indexStr, 10);
  };

  /** Measures the element using your configured `measureElement()` virtualizer option.
   * - You are repsonsible for calling this in your virtualizer markup when the component is rendered
   * (eg. using something like React's ref callback prop) also adding `data-index`
   */
  private _measureElement = (
    node: TItemElement,
    entry: ResizeObserverEntry | undefined,
  ) => {
    const index = this.indexFromElement(node);

    const item = this.measurementsCache[index];
    // console.log(';; _measureElem ', item);

    if (!item) {
      return;
    }

    const prevNode = this.measureElementCache.get(item.key);

    if (!node.isConnected) {
      this.observer.unobserve(node);
      if (node === prevNode) {
        this.measureElementCache.delete(item.key);
      }
      return;
    }

    if (prevNode !== node) {
      if (prevNode) {
        this.observer.unobserve(prevNode);
      }
      this.observer.observe(node);
      // 👇🏻 cache rendered dom
      this.measureElementCache.set(item.key, node);
    }

    const measuredItemSize = this.options.measureElement(node, entry, this);

    const itemSize = this.itemSizeCache.get(item.key) ?? item.size;

    const delta = measuredItemSize - itemSize;

    if (delta !== 0) {
      if (item.start < this.scrollOffset) {
        if (process.env.NODE_ENV !== 'production' && this.options.debug) {
          console.info('correction', delta);
        }

        this._scrollToOffset(this.scrollOffset, {
          adjustments: (this.scrollAdjustments += delta),
          behavior: undefined,
        });
      }

      this.pendingMeasuredCacheIndexes.push(index);

      this.itemSizeCache = new Map(
        this.itemSizeCache.set(item.key, measuredItemSize),
      );

      this.notify();
    }
  };

  measureElement = (node: TItemElement | null) => {
    if (!node) {
      return;
    }

    this._measureElement(node, undefined);
  };

  /**
   * Returns the virtual items for the current state of the virtualizer.
   */
  getVirtualItems = memo(
    () => [this.getIndexes(), this.getMeasurements()],
    (indexes, measurements) => {
      const virtualItems: VirtualItem[] = [];

      for (let k = 0, len = indexes.length; k < len; k++) {
        const i = indexes[k]!;
        const measurement = measurements[i]!;

        virtualItems.push(measurement);
      }

      return virtualItems;
    },
    {
      key: process.env.NODE_ENV !== 'production' && 'getIndexes',
      debug: () => this.options.debug,
    },
  );

  getVirtualItemForOffset = (offset: number) => {
    const measurements = this.getMeasurements();

    return notUndefined(
      measurements[
        findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index: number) => notUndefined(measurements[index]).start,
          offset,
        )
      ],
    );
  };

  getOffsetForAlignment = (toOffset: number, align: ScrollAlignment) => {
    const size = this.getSize();

    if (align === 'auto') {
      if (toOffset <= this.scrollOffset) {
        align = 'start';
      } else if (toOffset >= this.scrollOffset + size) {
        align = 'end';
      } else {
        align = 'start';
      }
    }

    if (align === 'start') {
      toOffset = toOffset;
    } else if (align === 'end') {
      toOffset = toOffset - size;
    } else if (align === 'center') {
      toOffset = toOffset - size / 2;
    }

    const scrollSizeProp = this.options.horizontal
      ? 'scrollWidth'
      : 'scrollHeight';
    const scrollSize = this.scrollElement
      ? 'document' in this.scrollElement
        ? this.scrollElement.document.documentElement[scrollSizeProp]
        : this.scrollElement[scrollSizeProp]
      : 0;

    const maxOffset = scrollSize - this.getSize();

    return Math.max(Math.min(maxOffset, toOffset), 0);
  };

  getOffsetForIndex = (index: number, align: ScrollAlignment = 'auto') => {
    index = Math.max(0, Math.min(index, this.options.count - 1));

    const measurement = notUndefined(this.getMeasurements()[index]);

    if (align === 'auto') {
      if (
        measurement.end >=
        this.scrollOffset + this.getSize() - this.options.scrollPaddingEnd
      ) {
        align = 'end';
      } else if (
        measurement.start <=
        this.scrollOffset + this.options.scrollPaddingStart
      ) {
        align = 'start';
      } else {
        return [this.scrollOffset, align] as const;
      }
    }

    const toOffset =
      align === 'end'
        ? measurement.end + this.options.scrollPaddingEnd
        : measurement.start - this.options.scrollPaddingStart;

    return [this.getOffsetForAlignment(toOffset, align), align] as const;
  };

  /** check if `this.measureElementCache.size > 0` */
  private isDynamicMode = () => this.measureElementCache.size > 0;

  private cancelScrollToIndex = () => {
    if (this.scrollToIndexTimeoutId !== null) {
      clearTimeout(this.scrollToIndexTimeoutId);
      this.scrollToIndexTimeoutId = null;
    }
  };

  scrollToOffset = (
    toOffset: number,
    { align = 'start', behavior }: ScrollToOffsetOptions = {},
  ) => {
    this.cancelScrollToIndex();

    if (behavior === 'smooth' && this.isDynamicMode()) {
      console.warn(
        'The `smooth` scroll behavior is not fully supported with dynamic size.',
      );
    }

    this._scrollToOffset(this.getOffsetForAlignment(toOffset, align), {
      adjustments: undefined,
      behavior,
    });
  };

  /**
   * Scrolls the virtualizer to the items of the index provided. You can optionally pass an alignment mode to anchor the scroll to a specific part of the scrollElement.
   */
  scrollToIndex = (
    index: number,
    { align: initialAlign = 'auto', behavior }: ScrollToIndexOptions = {},
  ) => {
    index = Math.max(0, Math.min(index, this.options.count - 1));

    this.cancelScrollToIndex();

    if (behavior === 'smooth' && this.isDynamicMode()) {
      console.warn(
        'The `smooth` scroll behavior is not fully supported with dynamic size.',
      );
    }

    const [toOffset, align] = this.getOffsetForIndex(index, initialAlign);

    this._scrollToOffset(toOffset, { adjustments: undefined, behavior });

    if (behavior !== 'smooth' && this.isDynamicMode()) {
      this.scrollToIndexTimeoutId = setTimeout(() => {
        this.scrollToIndexTimeoutId = null;

        const elementInDOM = this.measureElementCache.has(
          this.options.getItemKey(index),
        );

        if (elementInDOM) {
          const [toOffset] = this.getOffsetForIndex(index, align);

          if (!approxEqual(toOffset, this.scrollOffset)) {
            this.scrollToIndex(index, { align, behavior });
          }
        } else {
          this.scrollToIndex(index, { align, behavior });
        }
      });
    }
  };

  scrollBy = (delta: number, { behavior }: ScrollToOffsetOptions = {}) => {
    this.cancelScrollToIndex();

    if (behavior === 'smooth' && this.isDynamicMode()) {
      console.warn(
        'The `smooth` scroll behavior is not fully supported with dynamic size.',
      );
    }

    this._scrollToOffset(this.scrollOffset + delta, {
      adjustments: undefined,
      behavior,
    });
  };

  /**
   * Returns the total size in pixels for the virtualized items.
   * - This measurement will incrementally change if you choose to dynamically measure your elements as they are rendered.
   */
  getTotalSize = () =>
    (this.getMeasurements()[this.options.count - 1]?.end ||
      this.options.paddingStart) -
    this.options.scrollMargin +
    this.options.paddingEnd;

  /**
   * Scrolls the virtualizer to the pixel offset provided.
   * You can optionally pass an alignment mode to anchor the scroll to a specific part of the scrollElement.
   */
  private _scrollToOffset = (
    offset: number,
    {
      adjustments,
      behavior,
    }: {
      adjustments: number | undefined;
      behavior: ScrollBehavior | undefined;
    },
  ) => {
    this.options.scrollToFn(offset, { behavior, adjustments }, this);
  };

  /**
   * Resets any prev item measurements.
   */
  measure = () => {
    this.itemSizeCache = new Map();
    this.notify();
  };
}

const findNearestBinarySearch = (
  low: number,
  high: number,
  getCurrentValue: (i: number) => number,
  value: number,
) => {
  while (low <= high) {
    const middle = ((low + high) / 2) | 0;
    const currentValue = getCurrentValue(middle);

    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }

  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};

function calculateRangeIndex({
  measurements,
  outerSize,
  scrollOffset,
}: {
  measurements: VirtualItem[];
  outerSize: number;
  scrollOffset: number;
}) {
  const count = measurements.length - 1;
  const getOffset = (index: number) => measurements[index]!.start;

  const startIndex = findNearestBinarySearch(0, count, getOffset, scrollOffset);
  let endIndex = startIndex;

  while (
    endIndex < count &&
    measurements[endIndex]!.end < scrollOffset + outerSize
  ) {
    endIndex++;
  }

  return { startIndex, endIndex };
}
