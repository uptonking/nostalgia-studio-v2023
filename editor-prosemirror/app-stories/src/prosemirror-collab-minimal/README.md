# pm-collab minimal example
- https://prosemirror.net/docs/guide/#collab

> 只解决实时协作，不解决版本持久化

- 服务端只在内存存放最新的文档对象currDoc，只转发最新编辑操作steps
- 每个协作客户端初始时会拿到服务端文档currDoc，然后每个客户端都会保存所有客户端的所有操作steps

- 问题
  - undo-redo问题，只能在自己op后立即undo自己的操作，若其他人的操作进来，而undo无效
