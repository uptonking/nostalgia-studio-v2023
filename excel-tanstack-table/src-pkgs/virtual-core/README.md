# tanstack-virtual

> forked from https://github.com/tanstack/virtual  v3.0.0-beta, 202303

# overview

# internals

- view层rerender时会触发`getVirtualItems()`计算visible items
  - calculateRangeIndex根据scrollOffset和容器宽高
  - 返回virtualItem的信息 index, size, start, end, key, lane

- didMount
  - 对每个已测量过的元素注册ResizeObserver

- didUpdate
  - scrollToOffset
  - observe scrollElement's rect by ResizeObserver
  - observe scrollElement's scrollLeft/Top by scroll event

- calculateRangeIndex根据scrollOffset和容器宽高计算可见items的index
  - 先通过二分法找到scrollOffset在所有items中的位置
  - 然后根据容器宽高计算需要渲染的index

## examples

- sticky item implemented using `position: sticky`
# dev-later
- ## [Add reverse support](https://github.com/TanStack/virtual/pull/400)
  - [an inverted chat like list with tanstack's virtual](https://codesandbox.io/p/sandbox/immutable-silence-76pwko)
- In the end to have bi-directional infinite list we just need to sync scroll in case of prepend 
  - https://codesandbox.io/s/infinite-scroll-both-c08vxk
