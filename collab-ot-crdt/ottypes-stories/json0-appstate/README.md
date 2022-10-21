# ottypes-toy-appstate

# json0-appstate示例

- 功能
  - 实现了在客户端定期产生新op，然后通过ws同步到其他客户端
  - 服务端只在内存保存了doc、version，未保存操作记录

- This is a little toy prototype exploring the idea that each client shares a single JSON object with the server. 
  - Both the client and the server can read & edit the session object using OT. 
  - The object has all the data the client needs to know to run the app.
