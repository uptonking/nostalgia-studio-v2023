# typewriter json-patch syncable

# [示例](https://github.com/typewriter-editor/json-patch#syncable-object-store)

- tips
  - 客户端的version会接收服务端传来的并更新
  - 服务端记录 version+patch, 每次收到patch就version+1

## syncable

- It works by using metadata to track the current revision of the object, 
  - any outstanding changes needing to be sent to the server from the client, 
  - and the revisions of each added value on the server so that one may get all changes since the last revision was synced.
  - The metadata must be stored with the rest of the object to work.

- It does not handle adding/removing array items, though entire arrays can be set. 
  - It should work great for documents that don't need merging text like Figma 

- 元数据

```JS
// 客户端
{ rev: '07' }

// 服务端
{ rev: '07', paths: { '/ticker': '4', '/content': '07' } }
```

- 客户端发送给服务端 json-patch

```JS
 [{ op: 'replace', path: '/content', value: 0.3967347015756624 }]
```

- 服务端发送给客户端

```JSON
{
  "patch": [{
    "op": "replace",
    "path": "/content",
    "value": 0.4283930603719077
  }],
  "rev": "07"
}
```
