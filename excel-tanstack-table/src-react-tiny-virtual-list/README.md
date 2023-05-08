# react-tiny-virtual-list

- forked from https://github.com/clauderic/react-tiny-virtual-list
  - v3.0.0-beta, 202303

# overview

# usage

# internals
- 渲染时，会先根据容器宽高和scrollOffset计算visibleRange中item的起止index
  - 然后渲染sticky items和可见items
  - sticky items会渲染在普通items前面

- 首次渲染后，didMount会注册 scroll事件监听函数，每次scroll时会更新state.scrollOffset

- scrollTo 通过设置 `scrollTop/scrollLeft` 实现

- `findNearestItem(offset)` 根据scrollOffset查找下一个可见的item
  - 如果offset内的items已测量过，就用二分查找
  - 如果offset超过了已测量范围，就从下一个未测量的item开始，指数比较到offset的位置idx，然后在[idx/2, idx]范围内二分查找
# dev-later
- [Height of item](https://github.com/clauderic/react-tiny-virtual-list/issues/9)
  - When the window resizes, you'll need to call the `recomputeSizes` method on your instance of `VirtualList` to inform react-tiny-virtual-list that the size of your items have changed and should be re-rendered.

- [I have to force render the list again, if the list item heights are dynamic](https://github.com/clauderic/react-tiny-virtual-list/issues/52)
  - react-tiny-virtual-list uses PureComponent, and as such, it has no way to know when the sizes of your items changes when you use a function to get the item sizes.
