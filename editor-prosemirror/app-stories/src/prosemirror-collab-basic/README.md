# pm-collab basic example
- https://prosemirror.net/examples/collab

> 支持实时协作，支持持久化最新文档到服务端本地文件

- 服务端在内存存放最新的文档对象currDoc和所有客户端编辑操作steps
- 每个协作客户端初始时会拿到服务端文档currDoc，然后每个客户端不会保存其他客户端的操作steps

- 👀 注意
  - 服务端只保存和转发编辑操作/steps
  - 服务端计算量很少，服务端未执行transform，ot计算只在客户端
  - 若存在大量客户端，steps发送过于频繁可能导致性能问题
  - rebase逻辑可能导致数据丢失
  - 对于长时间离线的场景，steps计算量可能太大

- 问题
  - undo-redo问题，隔一段时间，undo和redo的按钮就会变灰，然后无法撤销重做

- ref
  - [Top 5 Ways to Implement Real-Time Rich Text Editor (ranked by complexity)_202101](https://exaspark.medium.com/top-5-ways-to-implement-real-time-rich-text-editor-ranked-by-complexity-3bc26e3c777f)
