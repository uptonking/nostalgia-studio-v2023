# pm-collab basic example
- https://prosemirror.net/examples/collab

> 支持实时协作，支持持久化最新文档到服务端文件

- 服务端在内存存放最新的文档对象currDoc和所有客户端编辑操作steps
- 每个协作客户端初始时会拿到服务端文档currDoc，然后每个客户端不会保存其他客户端的操作steps

- 问题
  - undo-redo问题，隔一段时间，undo和redo的按钮就会变灰，然后无法撤销重做
